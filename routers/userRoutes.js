const debug = require('debug')('tonksDEV:money:api:routing:user'),
    express = require('express');

const routes = function(moneyApiVars) {
    'use strict';

    const userRouter = express.Router(),
        userController = require('../controllers/userController')(moneyApiVars),
        acctController = require('../controllers/acctController')(moneyApiVars);

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
            if (req.headers.userid === moneyApiVars.systemacc) {
              userController.createUser(req.body, function(err, data) {
                  if (!err && data.saveStatus === 'created') {
                      res.status(200).json(data);
                  } else {
                      res.status(500).json({"error": "error creating new user", "errDetails" : err});
                  }
              })
            } else {
              res.status(403).json({"error": "access denied", "errDetails" : null});
            }
        });


    userRouter.route('/allusers')
        .get(function(req, res, next) {
            if (req.headers.userid === moneyApiVars.systemacc) {
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
            } else {
              res.status(403).json({"error": "access denied", "errDetails" : null});
            }
        });


    userRouter.route('/:uid')
      .get(function(req, res, next) {
          if (req.headers.userid === moneyApiVars.systemacc || req.headers.userid === req.params.uid) {
            userController.findUser(req.params.uid, function(err, userData) {
                if (err || !userData) {
                  res.status(500).json({"error": "user was not found", "userid":req.params.uid, "errDetails" : err});
                } else {
                  userData.user = addHATEOS(userData.user, req.headers.host);
                  res.status(200).json(userData);
                }
            })
          } else {
            res.status(403).json({"error": "access denied", "errDetails" : null});
          }
        })
      .put(function(req, res, next) {
        if (req.headers.userid === moneyApiVars.systemacc || req.headers.userid === req.params.uid) {
          userController.updateUser(req.params.uid, req.body, function(err, data) {
            if (!err && data.saveStatus === 'updated') {
                res.status(200).json(data);
            } else {
                res.status(500).json(err);
            }
          })
        } else {
          res.status(403).json({"error": "access denied", "errDetails" : null});
        }
      })
      .delete(function(req, res, next) {
        if (req.headers.userid === moneyApiVars.systemacc) {
          userController.deleteUser(req.params.uid, function(err, data) {
              if(!err && data.saveStatus === 'deleted') {
                  res.status(200).json(data);
              } else {
                  res.status(500).json(err);
              }
          })
        } else {
          res.status(403).json({"error": "access denied", "errDetails" : null});
        }
      });


    userRouter.route('/:uid/group/:gname')
        .put(function(req, res, next) {
            if (req.headers.userid === moneyApiVars.systemacc || req.headers.userid === req.params.uid) {
              userController.ensureUserIsInGroup(req.params.uid, req.params.gname, function(err, data) {
                  if (err || data.saveStatus === 'failed update') {
                    res.status(500).json({"error": "error adding user to group", "errDetails" : err});
                  } else {
                    acctController.findAccountGroup(moneyApiVars.systemacc, req.params.gname, function(err, accGroupData) {
                      if (err || !accGroupData) {
                        res.status(500).json({"error": "error resolving account group id from name", "errDetails" : err});
                      } else {
                        acctController.amendAccountGroup(moneyApiVars.systemacc, accGroupData.accountGroup.id, null, {"$addToSet": {"members": req.params.uid}}, function(err, affected) {
                          if (err || !affected) {
                            res.status(500).json({"error": "error adding user to group members list", "errDetails" : err});
                          } else {
                            res.status(200).json(data);
                          }
                        })
                      }
                    })
                  }
              })
            } else {
              res.status(403).json({"error": "access denied", "errDetails" : null});
            }
        })
        .delete(function(req, res, next) {
            if (req.headers.userid === moneyApiVars.systemacc || req.headers.userid === req.params.uid) {
              userController.ensureUserIsNotInGroup(req.params.uid, req.params.gname, function(err, data) {
                  if (err || data.saveStatus === 'failed update') {
                    res.status(500).json({"error": "error removing user from group", "errDetails" : err});
                  } else {
                    acctController.findAccountGroup(moneyApiVars.systemacc, req.params.gname, function(err, accGroupData) {
                      if (err || !accGroupData) {
                        res.status(500).json({"error": "error resolving account group id from name", "errDetails" : err});
                      } else {
                        acctController.amendAccountGroup(moneyApiVars.systemacc, accGroupData.accountGroup.id, null, {"$pull": {"members": req.headers.userid}}, function(err, affected) {
                          if (err || !affected) {
                            res.status(500).json({"error": "error pulling user from group members list", "errDetails" : err});
                          } else {
                            res.status(200).json(data);
                          }
                        })
                      }
                    })
                  }
              })
            } else {
              res.status(403).json({"error": "access denied", "errDetails" : null});
            }
        });


    userRouter.route('/email/:ueml')
      .get(function(req, res, next) {
          if (req.headers.userid === moneyApiVars.systemacc) {
            userController.findUserByEmail(req.params.ueml, function(err, userData) {
                if (err || !userData) {
                  res.status(500).json({"error": "user was not found", "userid":req.params.ueml, "errDetails" : err});
                } else {
                  userData.user = addHATEOS(userData.user, req.headers.host);
                  res.status(200).json(userData);
                }
            })
          } else {
            res.status(403).json({"error": "access denied", "errDetails" : null});
          }
        });


    userRouter.route('/group/:gid')
      .get(function(req, res, next) {
        if (req.headers.userid === moneyApiVars.systemacc) {
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
        } else {
          res.status(403).json({"error": "access denied", "errDetails" : null});
        }
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
