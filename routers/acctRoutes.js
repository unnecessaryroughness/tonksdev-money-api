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
            acctController.createAccount(req.body, function(err, newAcctData) {
                if (!err && newAcctData.saveStatus === 'created') {
                    newAcctData.account = addHATEOS(newAcctData.account, req.headers.host);
                    res.status(200).json(newAcctData);
                } else {
                    res.status(err.number || 500).json(err);
                }
            })
        });


    acctRouter.route('/allaccounts')
        .get(function(req, res, next) {
            acctController.findAllAccounts(req.headers.userid, function(err, acctData) {
              if (err || !acctData) {
                res.status(err.number || 400).json({"error": "error retrieving account list", "errDetails" : err});
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
          acctController.findAccount(req.headers.userid, req.params.acctid, function(err, acctData) {
              if (err || !acctData) {
                res.status(err.number || 400).json({"error": "error retrieving account", "acctid":req.params.acctid, "errDetails" : err});
              } else {
                acctData.account = addHATEOS(acctData.account, req.headers.host);
                res.status(200).json(acctData);
              }
          })
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


    acctRouter.route('/group')
        .post(function(req, res, next) {
        //     acctController.createAccount(req.body, function(err, newAcctData) {
        //         if (!err && newAcctData.saveStatus === 'created') {
        //             newAcctData.account = addHATEOS(newAcctData.account, req.headers.host);
        //             res.status(200).json(newAcctData);
        //         } else {
        //             res.status(err.number || 500).json(err);
        //         }
        //     })
        });



      acctRouter.route('/group/allgroups')
          .get(function(req, res, next) {
              acctController.findAllAccountGroups(req.headers.userid, function(err, acctGroupData) {
                if (err || !acctGroupData) {
                  res.status(err.number || 400).json({"error": "error retrieving account groups", "errDetails" : err});
                } else {
                  acctGroupData.accountGroupList.forEach(function(acct, idx, arr) {
                      // acct = addHATEOS(acct, req.headers.host);
                  });
                  res.status(200).json(acctGroupData);
                }
              })
          });

      acctRouter.route('/group/:accgid')
        .get(function(req, res, next) {
            acctController.findAccountGroup(req.headers.userid, req.params.accgid, function(err, acctGroupData) {
                if (err || !acctGroupData) {
                  res.status(err.number || 400).json({"error": "error retrieving account group", "groupid":req.params.accgid, "errDetails" : err});
                } else {
                  // acctGroupData.accountGroup = addHATEOS(acctGroupData.accountGroup, req.headers.host);
                  res.status(200).json(acctGroupData);
                }
            })
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
          acctController.findAllAccountsInGroup(req.headers.userid, req.params.accgid, function(err, acctData) {
              if (err || !acctData) {
                res.status(err.number || 400).json({"error": "could not retrieve accounts in requested group", "groupid":req.params.accgid, "errDetails" : err});
              } else {
                acctData.accountList.forEach(function(acct, idx, arr) {
                    acct = addHATEOS(acct, req.headers.host);
                });
                res.status(200).json(acctData);
              }
          })
        })


    function addHATEOS(acctRecord, hostAddress) {
      acctRecord.links.self = HATEOASProtocol + hostAddress + HATEOASJunction + acctRecord.id;
      acctRecord.links.accountGroup = HATEOASProtocol + hostAddress + HATEOASAcctGroupJunction + acctRecord.accountGroup;
      return acctRecord;
    }

    return acctRouter;
};

module.exports = routes;
