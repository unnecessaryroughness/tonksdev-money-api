const debug = require('debug')('tonksDEV:money:api:routing:account'),
      express = require('express');

const routes = function(moneyApiVars) {
    'use strict';

    const acctRouter = express.Router();
    const acctController = require('../controllers/acctController')(moneyApiVars);

    const HATEOASProtocol = 'http://',
          HATEOASJunction = '/account/',
          HATEOASAcctGroupJunction = '/account/group/';


    acctRouter.route('/')
        .get(function(req, res, next) {
            res.status(200).json({'availableFunctions': [
                  {'getAllAccounts': HATEOASProtocol + req.headers.host + HATEOASJunction + 'allaccounts'},
                  {'getAccountById': HATEOASProtocol + req.headers.host + HATEOASJunction + '[account-id]'},
                  {'getAllAccountGroups': HATEOASProtocol + req.headers.host + HATEOASAcctGroupJunction + 'allgroups'},
                  {'getAccountGroup': HATEOASProtocol + req.headers.host + HATEOASAcctGroupJunction + '[group-id]'},
                  {'getAllAccountsInGroup': HATEOASProtocol + req.headers.host + HATEOASAcctGroupJunction + '[group-id]/allaccounts'}
            ]})
        })
        .post(function(req, res, next) {
            // acctController.createUser(req.body, function(err, data) {
            //     if (!err && data.saveStatus === 'created') {
            //         res.status(200).json(data);
            //     } else {
            //         res.status(500).json(err);
            //     }
            // })
        });


    acctRouter.route('/allaccounts')
        .get(function(req, res, next) {
            acctController.findAllAccounts(function(err, acctData) {
              if (err || !acctData) {
                res.status(404).json({"error": "no account data was not found", "errDetails" : err});
              } else {
                acctData.accountList.forEach(function(val, idx, arr) {
                    val = addHATEOS(val, req.headers.host);
                });
                res.status(200).json(acctData);
              }
            })
        });


    acctRouter.route('/:acctid')
      .get(function(req, res, next) {
          // userController.findUser(req.params.uid, function(err, userData) {
          //     if (err || !userData) {
          //       res.status(500).json({"error": "user was not found", "userid":req.params.uid, "errDetails" : err});
          //     } else {
          //       userData.user = addHATEOS(userData.user, req.headers.host);
          //       res.status(200).json(userData);
          //     }
          // })
        })
      .put(function(req, res, next) {
          // userController.updateUser(req.params.uid, req.body, function(err, data) {
          //   if (!err && data.saveStatus === 'updated') {
          //       res.status(200).json(data);
          //   } else {
          //       res.status(500).json(err);
          //   }
          // })
      })
      .delete(function(req, res, next) {
          // userController.deleteUser(req.params.uid, function(err, data) {
          //     if(!err && data.saveStatus === 'deleted') {
          //         res.status(200).json(data);
          //     } else {
          //         res.status(500).json(err);
          //     }
          // })
      });


      acctRouter.route('/allgroups')
          .get(function(req, res, next) {
              // userController.findAllUsers(function(err, userData) {
              //   if (err || !userData) {
              //     res.status(500).json({"error": "no user was not found", "errDetails" : err});
              //   } else {
              //     userData.userList.forEach(function(val, idx, arr) {
              //         val = addHATEOS(val, req.headers.host);
              //     });
              //     res.status(200).json(userData);
              //   }
              // })
          });

      acctRouter.route('/group/:accgid')
        .get(function(req, res, next) {
            // userController.findUser(req.params.uid, function(err, userData) {
            //     if (err || !userData) {
            //       res.status(500).json({"error": "user was not found", "userid":req.params.uid, "errDetails" : err});
            //     } else {
            //       userData.user = addHATEOS(userData.user, req.headers.host);
            //       res.status(200).json(userData);
            //     }
            // })
          })
        .put(function(req, res, next) {
            // userController.updateUser(req.params.uid, req.body, function(err, data) {
            //   if (!err && data.saveStatus === 'updated') {
            //       res.status(200).json(data);
            //   } else {
            //       res.status(500).json(err);
            //   }
            // })
        })
        .delete(function(req, res, next) {
            // userController.deleteUser(req.params.uid, function(err, data) {
            //     if(!err && data.saveStatus === 'deleted') {
            //         res.status(200).json(data);
            //     } else {
            //         res.status(500).json(err);
            //     }
            // })
        });


    acctRouter.route('/group/:accgid/allaccounts')
      .get(function(req, res, next) {
          // userController.findUser(req.params.uid, function(err, userData) {
          //     if (err || !userData) {
          //       res.status(500).json({"error": "user was not found", "userid":req.params.uid, "errDetails" : err});
          //     } else {
          //       userData.user = addHATEOS(userData.user, req.headers.host);
          //       res.status(200).json(userData);
          //     }
          // })
        })


    function addHATEOS(acctRecord, hostAddress) {
      acctRecord.links.self = HATEOASProtocol + hostAddress + HATEOASJunction + acctRecord.id;
      acctRecord.links.accountGroup = HATEOASProtocol + hostAddress + HATEOASAcctGroupJunction + acctRecord.accountGroup;
      return acctRecord;
    }

    return acctRouter;
};

module.exports = routes;
