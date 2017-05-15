const debug = require('debug')('tonksDEV:money:api:routing:repeating'),
    dateFuncs = require("../common/dateFunctions"),
    express = require('express');

const routes = function(moneyApiVars) {
    'use strict';

    const reptRouter = express.Router(),
        reptController = require('../controllers/reptController')(moneyApiVars),
        transController = require('../controllers/transController')(moneyApiVars),
        accountController = require('../controllers/acctController')(moneyApiVars);

    const HATEOASProtocol = 'http://',
          HATEOASJunction = '/repeating/';

    reptRouter.route('/')
        .get(function(req, res, next) {
            res.status(200).json({'availableFunctions': [
                  // {'getRecentTrans': HATEOASProtocol + req.headers.host + HATEOASJunction + 'recent/[number-of-records-requested]/[account-id]'},
                  // {'getTransById': HATEOASProtocol + req.headers.host + HATEOASJunction + '[trans-id]'},
                  // {'createTransaction [POST]': HATEOASProtocol + req.headers.host + HATEOASJunction + '/[account-id]'}
            ]})
        })

    reptRouter.route('/')
        .post(function(req, res, next) {
          if (req.body && req.body.transaction && req.body.transaction.account && req.body.transaction.account.id && req.body.transaction.repeating) {
            accountController.findAccount(req.headers.userid, req.body.transaction.account.id, function(err, accountData) {
                if (err || !accountData) {
                  res.status(err.number || 404).json({"error": "account not found", "errDetails" : err});
                } else {
                  accountController.findAccountGroup(req.headers.userid, accountData.account.accountGroup, null, function(err, groupData) {
                    if (err || !groupData) {
                      res.status(err.number || 403).json({"error": "access to account group denied", "errDetails" : err});
                    } else {
                      //found accountgroup and the user is authorised to add new records to it
                      reptController.createRepeating(req.body, function(err, newRept) {
                        if (err || !newRept) {
                          res.status(err.number || 403).json({"error": "could not create repeating transaction", "errDetails" : err});
                        } else {
                          console.log(newRept);
                          newRept.transaction = addHATEOS(newRept.transaction, req.headers.host);
                          res.status(200).json(newRept);
                        }
                      })
                    }
                  })
                }
              })
            } else {
              res.status(500).json({"error": "some mandatory parameters were not supplied", "errDetails" : {}});
            }
          })



    reptRouter.route('/:rid')
      .get(function(req, res, next) {
          findAndValidateRept(req.headers.userid, req.params.rid, function(err, reptData) {
            if (err || !reptData) {
              res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
            } else {
              reptData.transaction = addHATEOS(reptData.transaction, req.headers.host);
              res.status(200).json(reptData);
            }
          })
        })
      .put(function(req, res, next) {
        findAndValidateRept(req.headers.userid, req.params.rid, function(err, reptData) {
          if (err || !reptData) {
            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
          } else {
            //found repeating trans, so user has the authority to update it
            reptController.updateRepeating(req.params.rid, req.body, function(err, updatedRepeat) {
              if (err || !updatedRepeat) {
                res.status(err.number || 403).json({"error": "failed to update repeating transaction", "errDetails" : err});
              } else {
                updatedRepeat.transaction = addHATEOS(updatedRepeat.transaction, req.headers.host);
                res.status(200).json(updatedRepeat);
              }
            })
          }
        })
      })
      .delete(function(req, res, next) {
        findAndValidateRept(req.headers.userid, req.params.rid, function(err, reptData) {
          if (err || !reptData) {
            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
          } else {
            //found repeating trans, so user has the authority to update it
            reptController.deleteRepeating(req.params.rid, function(err, data) {
              if (err || !data) {
                res.status(err.number || 500).json({"error": "error deleting repeating transaction", "errDetails" : err});
              } else {
                res.status(200).json(data);
              }
            })
          }
        })
      });



    reptRouter.route('/apply/:rid')
      .post(function(req, res, next) {
        //apply a single repeating transaction
        findAndValidateRept(req.headers.userid, req.params.rid, function(err, reptData) {
          if (err || !reptData) {
            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
          } else {
            reptData.transaction.transactionDate = reptData.transaction.repeating.nextDate;
            reptData.transaction.createdDate = dateFuncs.getTodaysDateYMD()
            transController.createTransaction(reptData, function(err, createdTrans) {
              if (err || !createdTrans) {
                res.status(err.number || 500).json({"error": "error creating transaction from repeating transaction", "errDetails" : err});
              } else {
                //successfully applied the transaction - now update the repeating trans by incrementing the frequency
                reptData.transaction.repeating.prevDate = reptData.transaction.repeating.nextDate;
                reptData.transaction.repeating.nextDate = calculateNextRepeatingDate(reptData.transaction.repeating);
                reptController.updateRepeating(req.params.rid, reptData, function(err, updatedRepeat) {
                  if (err || !updatedRepeat) {
                    res.status(err.number || 403).json({"error": "failed to update repeating transaction with revised nextDate", "errDetails" : err});
                  } else {
                    res.status(200).json(createdTrans);
                  }
                })
              }
            })
          }
        })
      })



    reptRouter.route('/group/:accg/applyto/:dte')
      .post(function(req, res, next) {
          accountController.findAccountGroup(req.headers.userid, req.params.accg, null, function(err, groupData) {
            if (err || !groupData) {
              res.status(err.number || 403).json({"error": "access to account group denied", "errDetails" : err});
            } else {
              //found accountgroup and the user is authorised to add new records to it
              reptController.findRepeatingToDate(req.params.dte, function(err, reptList) {
                if (err || !reptList) {
                  res.status(err.number || 403).json({"error": "could not find repeating transaction list", "errDetails" : err});
                } else {
                  var processed = 0;
                  reptList.transactionList.forEach(function(val, idx, arr) {

                      let tmpTrans = {transaction: null};
                      tmpTrans.transaction = val;

                      //create a new transaction based on this data
                      tmpTrans.transaction.transactionDate = tmpTrans.transaction.repeating.nextDate;
                      tmpTrans.transaction.createdDate = dateFuncs.getTodaysDateYMD();

                      transController.createTransaction(tmpTrans, function(err, createdTrans) {
                        if (err || !createdTrans) {
                          return res.status(err.number || 500).json({"error": "error creating transaction from repeating transaction", "errDetails" : err});
                          return;
                        } else {
                          //successfully applied the transaction - now update the repeating trans by incrementing the frequency
                          tmpTrans.transaction.repeating.prevDate = tmpTrans.transaction.repeating.nextDate;
                          tmpTrans.transaction.repeating.nextDate = calculateNextRepeatingDate(tmpTrans.transaction.repeating);
                          reptController.updateRepeating(tmpTrans.transaction.id, tmpTrans, function(err, updatedRepeat) {
                            if (err || !updatedRepeat) {
                              return res.status(err.number || 403).json({"error": "failed to update repeating transaction with revised nextDate", "errDetails" : err});
                            } else {
                              if (++processed === reptList.transactionList.length) {
                                return res.status(200).json({"repeatingTransactionsProcessed": processed});
                              }
                            }
                          })
                        }
                      })

                  });
                }
              })
            }
          })
      })



    reptRouter.route('/group/:accg/todate/:dte')
      .get(function(req, res, next) {
        accountController.findAccountGroup(req.headers.userid, req.params.accg, null, function(err, groupData) {
          if (err || !groupData) {
            res.status(err.number || 403).json({"error": "access to account group denied", "errDetails" : err});
          } else {
            //found accountgroup and the user is authorised to add new records to it
            reptController.findRepeatingToDate(req.params.dte, function(err, reptList) {
              if (err || !reptList) {
                res.status(err.number || 403).json({"error": "could not find repeating transaction list", "errDetails" : err});
              } else {
                reptList.transactionList.forEach(function(val, idx, arr) {
                    val = addHATEOS(val, req.headers.host);
                });
                res.status(200).json(reptList);
              }
            })
          }
        })
      })


    reptRouter.route('/group/:accg/allrepeating')
      .get(function(req, res, next) {
        accountController.findAccountGroup(req.headers.userid, req.params.accg, null, function(err, groupData) {
          if (err || !groupData) {
            res.status(err.number || 403).json({"error": "access to account group denied", "errDetails" : err});
          } else {
            //found accountgroup and the user is authorised to add new records to it
            // reptController.findRepeatingToDate("2099-01-01", function(err, reptList) {
            reptController.findAllRepeating(function(err, reptList) {
              if (err || !reptList) {
                res.status(err.number || 403).json({"error": "could not find repeating transaction list", "errDetails" : err});
              } else {
                reptList.transactionList.forEach(function(val, idx, arr) {
                    val = addHATEOS(val, req.headers.host);
                });
                res.status(200).json(reptList);
              }
            })
          }
        })
      })





    function findAndValidateRept(uid, rid, done) {
      //check the trans exists
      reptController.findRepeating(rid, function(err, reptData) {
          if (err || !reptData) {
            done({"error": "repeating transaction was not found", "transid": rid, "errDetails" : err}, null);
          } else {
            //check that the user is in the account group for the trans
            accountController.findAccountGroup(uid, reptData.transaction.account.group.id, null, function(err, groupData) {
              if ((err || !groupData) && reptData.transaction.account.group.length > 0) {
                done({"error": "access denied", "errDetails" : err}, null);
              } else {
                done(null, reptData);
              }
            })
          }
      })
    }


    // function resetAccountBalance(uid, acctid, acctcode, done) {
    //   transController.calculateAccountBalance(acctcode, function(err, foundBalance) {
    //     if (err || !foundBalance) {
    //       done({"error": "could not calculate account balance", "accountcode": acctcode, "errDetails" : err}, null);
    //     } else {
    //       accountController.updateAccount(uid, acctid, {account: {balance: foundBalance.accountBalance}}, function(err, data) {
    //         if (err || !data || !data.saveStatus || data.saveStatus !== 'updated') {
    //           done(res.status(err.number || 500).json({"error": "error updating balance of account account", "acctid": acctid, "errDetails" : err}));
    //         } else {
    //           done(null, data);
    //         }
    //       })
    //     }
    //   })
    // }


    // function resetAccountBalances(uid, acctlist, done) {
    //   var calculated = 0;
    //   for (let i = 0; i < acctlist.length; i++) {
    //     resetAccountBalance(uid, acctlist[i].id, acctlist[i].code, function(err, data) {
    //       if (err) {
    //         done(err, null);
    //         return;
    //       } else {
    //         debug("rebalancing account " + acctlist[i].id + " " + acctlist[i].code);
    //         if (++calculated === acctlist.length) {
    //           done(null, {balancesUpdated: i});
    //         }
    //       }
    //     })
    //   }
    // }

    function addHATEOS(transRecord, hostAddress) {
      transRecord.links = [{"self": HATEOASProtocol + hostAddress + HATEOASJunction + transRecord.id}];
      return transRecord;
    }

    function calculateNextRepeatingDate(reptParams) {
      let baseDate  = reptParams.nextDate,
          dBaseDate = new Date(baseDate),
          dTargetDate = new Date(baseDate),
          frequency = reptParams.frequency.code,
          increment = reptParams.frequency.increment;

      switch (frequency) {
        case "D":
          dTargetDate.setDate(dBaseDate.getDate()+increment);
          break;
        case "W":
          dTargetDate.setDate(dBaseDate.getDate()+(increment*7));
          break;
        case "M":
          dTargetDate.setMonth(dBaseDate.getMonth()+increment);
          break;
        case "Y":
          dTargetDate.setFullYear(dBaseDate.getFullYear()+increment);
          break;
        default:
          break;
      }

      return dTargetDate;
    }



    return reptRouter;
};

module.exports = routes;
