const debug = require('debug')('tonksDEV:money:api:routing:transaction'),
    express = require('express');

const routes = function(moneyApiVars) {
    'use strict';

    const transRouter = express.Router(),
        transController = require('../controllers/transController')(moneyApiVars),
        accountController = require('../controllers/acctController')(moneyApiVars);

    const HATEOASProtocol = 'http://',
          HATEOASJunction = '/transaction/';

    transRouter.route('/')
        .get(function(req, res, next) {
            res.status(200).json({'availableFunctions': [
                  {'getRecentTrans': HATEOASProtocol + req.headers.host + HATEOASJunction + 'recent/[number-of-records-requested]/[account-id]'},
                  {'getTransById': HATEOASProtocol + req.headers.host + HATEOASJunction + '[trans-id]'},
                  {'createTransaction [POST]': HATEOASProtocol + req.headers.host + HATEOASJunction + '/[account-id]'}
            ]})
        })

    transRouter.route('/')
        .post(function(req, res, next) {
          if (req.body && req.body.transaction && req.body.transaction.account && req.body.transaction.account.id) {
                  accountController.findAccount(req.headers.userid, req.body.transaction.account.id, function(err, accountData) {
                      if (err || !accountData) {
                        res.status(err.number || 404).json({"error": "account not found", "errDetails" : err});
                      } else {
                        accountController.findAccountGroup(req.headers.userid, accountData.account.accountGroup, null, function(err, groupData) {
                          if (err || !groupData) {
                            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
                          } else {
                            //found accountgroup and the user is authorised to add new records to it
                            transController.createTransaction(req.body, function(err, newTrans) {
                              newTrans.transaction = addHATEOS(newTrans.transaction, req.headers.host);
                              resetAccountBalance(req.headers.userid, newTrans.transaction.account.id, newTrans.transaction.account.code, function(err, balData) {
                                if (err || !balData) {
                                  res.status(err.number || 500).json({"error": "error updating balance of account", "errDetails" : err});
                                } else {
                                  res.status(200).json(newTrans);
                                }
                              });
                            })
                          }
                        })
                      }
                    })
            } else {
              res.status(500).json({"error": "no account id specified", "errDetails" : {}});
            }
          })


    transRouter.route('/recent/:recs/:acctid')
        .get(function(req, res, next) {
            if (req.headers.userid) {
              //check that the current user is in the requested account group
              accountController.findAccount(req.headers.userid, req.params.acctid, function(err, acctData) {
                if (err || !acctData) {
                  res.status(err.number || 403).json({"error": "access denied", "errDetails": err})
                } else {
                  //get all trans from that account group
                  transController.findAllRecentTransactions(req.params.acctid, req.params.recs, function(err, transData) {
                    if (err || !transData) {
                      res.status(err.number || 404).json({"error": "could not find any transactions", "errDetails" : err});
                    } else {
                      transData.transactionList.forEach(function(val, idx, arr) {
                          val = addHATEOS(val, req.headers.host);
                          val.account.name = acctData.account.accountName;
                      });
                      res.status(200).json(transData);
                    }
                  });
                }
              });
            }
      });


    transRouter.route('/clear/:tid')
      .put(function(req, res, next) {
        findAndValidateTrans(req.headers.userid, req.params.tid, function(err, transData) {
          if (err || !transData) {
            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
          } else {
            //found trans, so user has the authority to update it
            let currentClearedStatus = transData.transaction.isCleared;
            let targetClearedStatus = !currentClearedStatus;
            transController.updateTransaction(req.params.tid, {"transaction": {isCleared: targetClearedStatus, notes: 'updated'}}, function(err, updatedTrans) {
              updatedTrans.transaction = addHATEOS(updatedTrans.transaction, req.headers.host);
              res.status(200).json(updatedTrans);
            })
          }
        })
      })


    transRouter.route('/:tid')
      .get(function(req, res, next) {
          findAndValidateTrans(req.headers.userid, req.params.tid, function(err, transData) {
            if (err || !transData) {
              res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
            } else {
              transData.transaction = addHATEOS(transData.transaction, req.headers.host);
              res.status(200).json(transData);
            }
          })
        })
      .put(function(req, res, next) {
        findAndValidateTrans(req.headers.userid, req.params.tid, function(err, transData) {
          if (err || !transData) {
            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
          } else {
            //found trans, so user has the authority to update it
            transController.updateTransaction(req.params.tid, req.body, function(err, updatedTrans) {
              if (err || !updatedTrans) {
                res.status(err.number || 403).json({"error": "failed to update transaction", "errDetails" : err});
              } else {
                updatedTrans.transaction = addHATEOS(updatedTrans.transaction, req.headers.host);
                resetAccountBalance(req.headers.userid, updatedTrans.transaction.account.id, updatedTrans.transaction.account.code, function(err, balData) {
                  if (err || !balData) {
                    res.status(err.number || 500).json({"error": "error updating balance of account", "errDetails" : err});
                  } else {
                    if (req.body.transaction.account.previous && req.body.transaction.account.previous.id && req.body.transaction.account.previous.code) {
                      resetAccountBalance(req.headers.userid, req.body.transaction.account.previous.id, req.body.transaction.account.previous.code, function(err, balData) {
                        if (err || !balData) {
                          res.status(err.number || 500).json({"error": "error updating balance of previous account", "errDetails" : err});
                        } else {
                          res.status(200).json(updatedTrans);
                        }
                      })
                    } else {
                      res.status(200).json(updatedTrans);
                    }
                  }
                })
              }
            })
          }
        })
      })
      .delete(function(req, res, next) {
        findAndValidateTrans(req.headers.userid, req.params.tid, function(err, transData) {
          if (err || !transData) {
            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
          } else {
            //found trans, so user has the authority to update it
            transController.deleteTransaction(req.params.tid, function(err, data) {
              resetAccountBalance(req.headers.userid, transData.transaction.account.id, transData.transaction.account.code, function(err, balData) {
                if (err || !balData) {
                  res.status(err.number || 500).json({"error": "error updating balance of account", "errDetails" : err});
                } else {
                  res.status(200).json(data);
                }
              })
            })
          }
        })
      });


    function findAndValidateTrans(uid, tid, done) {
      //check the trans exists
      transController.findTransaction(tid, function(err, transData) {
          if (err || !transData) {
            done({"error": "transaction was not found", "transid": tid, "errDetails" : err}, null);
          } else {
            //check that the user is in the account group for the trans
            accountController.findAccountGroup(uid, transData.transaction.account.group.id, null, function(err, groupData) {
              if ((err || !groupData) && transData.transaction.account.group.length > 0) {
                done({"error": "access denied", "errDetails" : err}, null);
              } else {
                done(null, transData);
              }
            })
          }
      })
    }


    function resetAccountBalance(uid, acctid, acctcode, done) {
      transController.calculateAccountBalance(acctcode, function(err, foundBalance) {
        if (err || !foundBalance) {
          done({"error": "could not calculate account balance", "accountcode": acctcode, "errDetails" : err}, null);
        } else {
          accountController.updateAccount(uid, acctid, {account: {balance: foundBalance.accountBalance}}, function(err, data) {
            if (err || !data || !data.saveStatus || data.saveStatus !== 'updated') {
              done(res.status(err.number || 500).json({"error": "error updating balance of account account", "acctid": acctid, "errDetails" : err}));
            } else {
              done(null, data);
            }
          })
        }
      })
    }

    function addHATEOS(transRecord, hostAddress) {
      transRecord.links.self = HATEOASProtocol + hostAddress + HATEOASJunction + transRecord.id;
      return transRecord;
    }

    return transRouter;
};

module.exports = routes;
