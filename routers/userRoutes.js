const debug = require('debug')('tonksDEV:money:api:routing:user'),
    express = require('express');

const routes = function(moneyApiVars) {
    'use strict';

    const userRouter = express.Router(),
        userController = require('../controllers/userController')(moneyApiVars);

    const HATEOASProtocol = 'http://',
          HATEOASJunction = '/user/',
          HATEOASUserGroupJunction = '/user/group/';


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
                res.status(500).json({"error": "no user was not found", "errDetails" : err});
              } else {
                userData.userList.forEach(function(val, idx, arr) {
                    val = addHATEOS(val, req.headers.host);
                });
                res.status(200).json(userData);
              }
            })
        });


    userRouter.route('/:uid')
      .get(function(req, res, next) {
          userController.findUser(req.params.uid, function(err, userData) {
              if (err || !userData) {
                res.status(500).json({"error": "user was not found", "userid":req.params.uid, "errDetails" : err});
              } else {
                userData.user = addHATEOS(userData.user, req.headers.host);
                res.status(200).json(userData);
              }
          })
        })
      .put(function(req, res, next) {
          userController.updateUser(req.params.uid, req.body, function(err, data) {
            if (!err && data.saveStatus === 'updated') {
                res.status(200).json(data);
            } else {
                res.status(500).json(err);
            }
          })
      })
      .delete(function(req, res, next) {
          userController.deleteUser(req.params.uid, function(err, data) {
              if(!err && data.saveStatus === 'deleted') {
                  res.status(200).json(data);
              } else {
                  res.status(500).json(err);
              }
          })
      });


    userRouter.route('/email/:ueml')
      .get(function(req, res, next) {
          userController.findUserByEmail(req.params.ueml, function(err, userData) {
              if (err || !userData) {
                res.status(500).json({"error": "user was not found", "userid":req.params.ueml, "errDetails" : err});
              } else {
                userData.user = addHATEOS(userData.user, req.headers.host);
                res.status(200).json(userData);
              }
          })
        });


    userRouter.route('/group/:gid')
      .get(function(req, res, next) {
          userController.findAllUsersByGroupId(req.params.gid, function(err, userData) {
            if (err || !userData) {
              res.status(500).json({"error": "no user was not found in requested group", "errDetails" : err});
            } else {
              userData.userList.forEach(function(val, idx, arr) {
                  val = addHATEOS(val, req.headers.host);
              });
              res.status(200).json(userData);
            }
        });
      });


    function addHATEOS(userRecord, hostAddress) {
      userRecord.links.self = HATEOASProtocol + hostAddress + HATEOASJunction + userRecord.id;
      if (userRecord.groups) {
          userRecord.groups.forEach(function (gVal, gIdx, gArr) {
            userRecord.links[gVal] = HATEOASProtocol + hostAddress + HATEOASUserGroupJunction + gVal;
          });
      }
      return userRecord;
    }

    return userRouter;
};

module.exports = routes;
