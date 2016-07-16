const debug = require('debug')('tonksDEV:money:api:routing:user'),
    express = require('express');

const routes = function(moneyApiVars) {
    'use strict';

    const userRouter = express.Router(),
        userController = require('../controllers/userController')(moneyApiVars);

    const HATEOASProtocol = 'http://',
          HATEOASJunction = '/user/';


    userRouter.route('/')
        .get(function(req, res, next) {
            res.status(200).json({'availableFunctions': [
                  {'getAllUsers': HATEOASProtocol + req.headers.host + HATEOASJunction + 'allusers'},
                  {'getUserById': HATEOASProtocol + req.headers.host + HATEOASJunction + '[user-id]'},
                  {'getUserByEmail': HATEOASProtocol + req.headers.host + HATEOASJunction + 'email/[user-email-address]'}
            ]})
        })
        .post(function(req, res, next) {
            userController.createUser(req.body, function(err, data) {
                if (!err && data.saveStatus === 'created') {
                    res.status(200).json(data);
                } else {
                    res.status(500).json(err);
                }
            })
        });


    userRouter.route('/allusers')
        .get(function(req, res, next) {
            userController.findAllUsers(function(err, userData) {
              if (err || !userData) {
                debug('No Users found');
                res.status(500).json({"error": "no user was not found", "errDetails" : err});
              } else {
                debug('Users found - router is sending success!');
                userData.userList.forEach(function(val, idx, arr) {
                    val.links.self = HATEOASProtocol + req.headers.host + HATEOASJunction + val.id;
                });
                res.status(200).json(userData);
              }
            })
        });


    userRouter.route('/:uid')
      .get(function(req, res, next) {
          userController.findUser(req.params.uid, function(err, userData) {
              if (err || !userData) {
                debug('User not found - router is sending an error');
                res.status(500).json({"error": "user was not found", "userid":req.params.uid, "errDetails" : err});
              } else {
                debug('User found - router is sending success!');
                userData.user.links.allUsers = HATEOASProtocol + req.headers.host + HATEOASJunction + 'allusers';
                res.status(200).json(userData);
              }
          })
        })
      .put(function(req, res, next) {
          userController.updateUser(req.body, function(err, data) {
              //handle response
              userController.updateUser(req.body, function(err, data) {
                if (!err && data.saveStatus === 'updated') {
                    res.status(200).json(data);
                } else {
                    res.status(500).json(err);
                }
              })
          })
      });


    userRouter.route('/email/:ueml')
      .get(function(req, res, next) {
          userController.findUserByEmail(req.params.ueml, function(err, userData) {
              if (err || !userData) {
                debug('User not found - router is sending an error');
                res.status(500).json({"error": "user was not found", "userid":req.params.ueml, "errDetails" : err});
              } else {
                debug('User found - router is sending success!');
                userData.user.links.allUsers = HATEOASProtocol + req.headers.host + HATEOASJunction + 'allusers';
                res.status(200).json(userData);
              }
          })
        });



    return userRouter;
};

module.exports = routes;
