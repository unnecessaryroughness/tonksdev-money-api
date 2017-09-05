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
                              if (err || !newTrans) {
                                res.status(err.number || 403).json({"error": "could not create transaction", "errDetails" : err});
                              } else {
                                newTrans.transaction = addHATEOS(newTrans.transaction, req.headers.host);

                                let accountsToRebalance = [];
                                let txAccount = newTrans.transaction.account;
                                let txTransferAccount = newTrans.transaction.payee.transferAccount;
                                accountsToRebalance.push({id: txAccount.id, code: txAccount.code});
                                if(txTransferAccount && txTransferAccount.id && txTransferAccount.code) {
                                  accountsToRebalance.push({id: txTransferAccount.id, code: txTransferAccount.code});
                                }
                                resetAccountBalances(req.headers.userid, accountsToRebalance, function(err, rebalanceCount) {
                                  if (err || !rebalanceCount) {
                                    res.status(err.number || 500).json({"error": "error updating balance of previous account", "errDetails" : err});
                                  } else {
                                    res.status(200).json(newTrans);
                                  }
                                });

                              }
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


    transRouter.route('/placeholders/:acctid')
        .get(function(req, res, next) {
            if (req.headers.userid) {
              //check that the current user is in the requested account group
              accountController.findAccount(req.headers.userid, req.params.acctid, function(err, acctData) {
                if (err || !acctData) {
                  res.status(err.number || 403).json({"error": "access denied", "errDetails": err})
                } else {
                  //get all trans from that account group
                  transController.findAllFuturePlaceholderTransactions(req.params.acctid, function(err, transData) {
                    if (err || !transData) {
                      res.status(err.number || 404).json({"error": "could not find any future-dated placeholder transactions", "errDetails" : err});
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


    transRouter.route('/payeerecent/:acctid/:payeeid/:catid?')
        .get(function(req, res, next) {
            if (req.headers.userid) {
              //check that the current user is in the requested account group
              accountController.findAccount(req.headers.userid, req.params.acctid, function(err, acctData) {
                if (err || !acctData) {
                  res.status(err.number || 403).json({"error": "access denied", "errDetails": err})
                } else {
                  //get all trans from that account group
                  transController.findMostRecentTransactionForPayee(req.params.acctid, req.params.payeeid, req.params.catid, function(err, transData) {
                    if (err || !transData) {
                      res.status(err.number || 404).json({"error": "could not find any recent transactions for this payee", "errDetails" : err});
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
            transController.updateTransaction(req.params.tid, {"transaction": {isCleared: targetClearedStatus}}, function(err, updatedTrans) {
              if (err || !updatedTrans) {
                res.status(err.number || 500).json({"error": "error updating transaction cleared flag", "errDetails" : err});
              } else {
                updatedTrans.transaction = addHATEOS(updatedTrans.transaction, req.headers.host);
                res.status(200).json(updatedTrans);
              }
            })
          }
        })
      })


    transRouter.route('/adjust/:tid')
      .put(function(req, res, next) {
        findAndValidateTrans(req.headers.userid, req.params.tid, function(err, transData) {
          if (err || !transData) {
            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
          } else {
            //found trans, so user has the authority to update it
            let currentAmount = transData.transaction.amount;
            let targetAmount = (parseFloat(currentAmount) + parseFloat(req.body.adjustBy)).toFixed(2);
            transController.updateTransaction(req.params.tid, {"transaction": {amount: targetAmount}}, function(err, updatedTrans) {
              if (err || !updatedTrans) {
                res.status(err.number || 500).json({"error": "error updating transaction balance", "errDetails" : err});
              } else {
                resetAccountBalance(req.headers.userid, transData.transaction.account.id, transData.transaction.account.code, function(err, data) {
                  if (err || !data) {
                    res.status(err.number || 500).json({"error": "error refreshing account balance", "errDetails" : err})
                  } else {
                    updatedTrans.transaction = addHATEOS(updatedTrans.transaction, req.headers.host);
                    res.status(200).json(updatedTrans);
                  }
                })
              }
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

                let accountsToRebalance = [];
                accountsToRebalance.push({id: updatedTrans.transaction.account.id, code: updatedTrans.transaction.account.code});
                if (req.body.transaction.account.previous && req.body.transaction.account.previous.id && req.body.transaction.account.previous.code) {
                  accountsToRebalance.push({id: req.body.transaction.account.previous.id, code: req.body.transaction.account.previous.code});
                }
                if(req.body.transaction.payee.transferAccount && req.body.transaction.payee.transferAccount.id && req.body.transaction.payee.transferAccount.code) {
                  accountsToRebalance.push({id: req.body.transaction.payee.transferAccount.id, code: req.body.transaction.payee.transferAccount.code});
                }
                resetAccountBalances(req.headers.userid, accountsToRebalance, function(err, rebalanceCount) {
                  if (err || !rebalanceCount) {
                    res.status(err.number || 500).json({"error": "error updating balance of previous account", "errDetails" : err});
                  } else {
                    res.status(200).json(updatedTrans);
                  }
                });

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

              let accountsToRebalance = [];
              let txAccount = transData.transaction.account;
              let txTransferAccount = transData.transaction.payee.transferAccount;
              accountsToRebalance.push({id: txAccount.id, code: txAccount.code});
              if(txTransferAccount && txTransferAccount.id && txTransferAccount.code) {
                accountsToRebalance.push({id: txTransferAccount.id, code: txTransferAccount.code});
              }
              resetAccountBalances(req.headers.userid, accountsToRebalance, function(err, rebalanceCount) {
                if (err || !rebalanceCount) {
                  res.status(err.number || 500).json({"error": "error updating balance of previous account", "errDetails" : err});
                } else {
                  res.status(200).json(data);
                }
              });
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
              done({"error": "error updating balance of account account", "acctid": acctid, "errDetails" : err}, null);
            } else {
              done(null, data);
            }
          })
        }
      })
    }


    function resetAccountBalances(uid, acctlist, done) {
      var calculated = 0;
      for (let i = 0; i < acctlist.length; i++) {
        resetAccountBalance(uid, acctlist[i].id, acctlist[i].code, function(err, data) {
          if (err) {
            done(err, null);
            return;
          } else {
            debug("rebalancing account " + acctlist[i].id + " " + acctlist[i].code);
            if (++calculated === acctlist.length) {
              done(null, {balancesUpdated: i});
            }
          }
        })
      }
    }

    function addHATEOS(transRecord, hostAddress) {
      transRecord.links.self = HATEOASProtocol + hostAddress + HATEOASJunction + transRecord.id;
      return transRecord;
    }

    return transRouter;
};

module.exports = routes;
