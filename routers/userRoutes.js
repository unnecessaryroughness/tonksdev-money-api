const debug = require('debug')('tonksDEV:money:api:routing:user'),
    express = require('express');

const routes = function(moneyApiVars) {
    'use strict';

    let userRouter = express.Router(),
        userController = require('../controllers/userController')(moneyApiVars);

    const HATEOASProtocol = 'http://',
          HATEOASJunction = '/user/';

    userRouter.route('/allusers')
        .get(function(req, res, next) {
            userController.findAllUsers(function(err, userData) {
              if (err || !userData) {
                debug('No Users found');
                return res.status(500).json({"error": "no user was not found"});
              } else {
                debug('Users found - router is sending success!');
                userData.forEach(function(val, idx, arr) {
                    val.links.self = HATEOASProtocol + req.headers.host + HATEOASJunction + val.id;
                });
                return res.status(200).json(userData);
              }
            })
        });

    userRouter.route('/:uid')
      .get(function(req, res, next) {
          userController.findUser(req.params.uid, function(err, userData) {
              if (err || !userData) {
                debug('User not found - router is sending an error');
                return res.status(500).json({"error": "user was not found", "userid":req.params.uid});
              } else {
                debug('User found - router is sending success!');
                userData.links.allUsers = HATEOASProtocol + req.headers.host + HATEOASJunction + 'allusers';
                return res.status(200).json(userData);
              }
          })
        });

    userRouter.route('/email/:ueml')
      .get(function(req, res, next) {
          userController.findUserByEmail(req.params.ueml, function(err, userData) {
              if (err || !userData) {
                debug('User not found - router is sending an error');
                return res.status(500).json({"error": "user was not found", "userid":req.params.uid});
              } else {
                debug('User found - router is sending success!');
                userData.links.allUsers = HATEOASProtocol + req.headers.host + HATEOASJunction + 'allusers';
                return res.status(200).json(userData);
              }
          })
        });



    return userRouter;
};

module.exports = routes;
