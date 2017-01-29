const mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:controller:transaction'),
    constructErrReturnObj = require('../common/moneyErrorObj'),
    dateFormat = require("dateformat"),
    currencyFormat = require("currency-formatter"),
    transaction = require('../models/transactionModel');

const controller = function(moneyApiVars) {
  'use strict';

  const findTransaction = function(tid, done) {
    if (tid == 0) {
      let newTrans = new transaction;
      done(null, {'transaction': constructTransObjectForRead(newTrans)});
    } else {
      transaction.findById(tid, function(err, foundTrans) {
        if (err || !foundTrans) {
          done(constructErrReturnObj(err, 'could not find transaction', 404), null);
        } else {
          done(null, {'transaction': constructTransObjectForRead(foundTrans)});
        }
      })
    }
  }


  const createTransaction = function(reqBody, done) {
    let txn = reqBody.transaction || {};
    if ((txn.account  && txn.account.id && txn.account.group.id) &&
        (txn.payee    && (txn.payee.id || txn.payee.transferAccount.id)) &&
        (txn.category && txn.category.id) &&
        (txn.amount)) {

      let newTrans = constructTransObjectForSave(reqBody.transaction);
      newTrans.save(function(err, savedTrans) {
          if (err || !savedTrans) {
            done(constructErrReturnObj(err, 'error saving new transaction', 500), {'saveStatus': 'failed create'});
          } else {
            done(null, {'saveStatus': 'created', 'transaction': constructTransObjectForRead(savedTrans)});
          }
      });
    } else {
      done(constructErrReturnObj(null, 'mandatory fields were not supplied', 500), {'saveStatus': 'failed create'});
    }
  }


  const updateTransaction = function(tid, reqBody, done) {
    if (tid && reqBody) {
      transaction.findById(tid, function(err, foundTrans) {
        if (err || !foundTrans) {
          done(constructErrReturnObj(err, 'transaction could not be found in the database', 404), {'saveStatus': 'failed update'});
        } else {
          let updatedTrans = constructTransObjectForUpdate(foundTrans, reqBody.transaction);
          updatedTrans.save(function(err, savedTrans) {
              if (err) {
                done(constructErrReturnObj(err, 'transaction record could not be updated in the database', 400), {'saveStatus': 'failed update'});
              } else {
                done(null, {'saveStatus': 'updated', 'transaction': constructTransObjectForRead(savedTrans)});
              }
          })
        }
      });
    } else {
      done(constructErrReturnObj(null, 'mandatory fields were not supplied', 500), {'saveStatus': 'failed update'});
    }
  }


  const deleteTransaction = function(tid, done) {
    if (tid) {
      transaction.findById(tid, function(err, foundTrans) {
        if (err || !foundTrans) {
          done(constructErrReturnObj(err, 'transaction could not be found in the database', 404), {'saveStatus': 'failed delete'});
        } else {
          foundTrans.remove(function(err) {
            if (err) {
              done(constructErrReturnObj(err, 'error removing transaction from database', 500), {'saveStatus': 'failed delete'});
            } else {
              done(null, {'saveStatus': 'deleted'});
            }
          })
        }
      });
    }
  }

  const findAllRecentTransactions = function(acctId, numRecs, done) {
      transaction.find({'account.id': acctId}).limit(parseInt(numRecs)).sort({transactionDate: -1, createdDate: -1}).exec(function(err, foundTrans) {
        if (err || !foundTrans || foundTrans.length === 0) {
            done(constructErrReturnObj(err, 'could not find any transactions', 404), null);
        } else {
            calculateAccountBalance(foundTrans[0].account.code, function(err, foundBalance) {
              if (err || !foundBalance) {
                done(constructErrReturnObj(err, 'could not calculate account balance', 500), null);
              } else {
                done(null, {'transactionList': constructTransList(foundTrans, foundBalance.accountBalance), 'accountBalance': foundBalance.accountBalance});
              }
            })
        }
      })
  }

  const calculateAccountBalance = function(accountCode, done) {
    transaction.aggregate([{$match: {"account.code": accountCode}}, { $group: {_id: null, totalBalance: {$sum: "$amount"}} }], function(err, foundBalance) {
      if (err) {
        done(constructErrReturnObj(err, 'could not get aggregate of account transactions', 500), null);
      } else {
        if (foundBalance.length > 0) {
          done(null, {'accountBalance': foundBalance[0].totalBalance.toFixed(2)});
        } else {
          done(null, {'accountBalance': parseFloat(0).toFixed(2)});
        }
      }
    })
  }


  const constructTransObjectForRead = function(transFromDB) {
      let rtnTrans = {id: null};
      if (transFromDB) {
          rtnTrans.id             = transFromDB._id;
          rtnTrans.account        = transFromDB.account;
          rtnTrans.payee          = transFromDB.payee;
          rtnTrans.category       = transFromDB.category;
          rtnTrans.amount         = transFromDB.amount;
          rtnTrans.transactionDate = dateFormat(transFromDB.transactionDate, "yyyy-mm-dd");
          rtnTrans.createdDate    = dateFormat(transFromDB.createdDate, "yyyy-mm-dd");
          rtnTrans.notes          = transFromDB.notes;
          rtnTrans.isCleared      = transFromDB.isCleared;
          rtnTrans.isPlaceholder  = transFromDB.isPlaceholder;
          rtnTrans.balance        = 0;
          rtnTrans.repeating      = transFromDB.repeating;
          rtnTrans.links = {};
      }

      return rtnTrans;
  }

  const constructTransList = function(transListFromDB, totalBalance) {
      let rtnTransList = [];
      if (transListFromDB && transListFromDB.length > 0) {
          transListFromDB.forEach(function(val, idx, arr) {
              rtnTransList.push(constructTransObjectForRead(val));
          })
      }

      //set balance in descending order
      rtnTransList.forEach(function(val, idx, arr) {
        val.balance = totalBalance;
        // totalBalance = (totalBalance - parseFloat(val.amount.substr(1)).toFixed(2)).toFixed(2);
        totalBalance = (totalBalance - parseFloat(val.amount).toFixed(2)).toFixed(2);
      });

      return rtnTransList;
  }


  const constructTransObjectForSave = function(transFromApp) {
      let newTrans = new transaction;
      if (transFromApp) {
          newTrans.account       = transFromApp.account;
          newTrans.payee         = transFromApp.payee;
          newTrans.category      = transFromApp.category;
          newTrans.amount        = transFromApp.amount;
          newTrans.transactionDate = transFromApp.transactionDate;
          newTrans.notes         = transFromApp.notes;
          newTrans.isCleared     = transFromApp.isCleared;
          newTrans.isPlaceholder = transFromApp.isPlaceholder;
          newTrans.repeating     = transFromApp.repeating;
      }
      return newTrans;
  }

  const constructTransObjectForUpdate = function(transObject, transFromApp) {
      if (transFromApp) {
          if (transFromApp.account)         transObject.account         = transFromApp.account;
          if (transFromApp.payee)           transObject.payee           = transFromApp.payee;
          if (transFromApp.category)        transObject.category        = transFromApp.category;
          if (transFromApp.amount)          transObject.amount          = transFromApp.amount;
          if (transFromApp.transactionDate) transObject.transactionDate = transFromApp.transactionDate;
          if (transFromApp.notes)           transObject.notes           = transFromApp.notes;
          if (transFromApp.isCleared)       transObject.isCleared       = transFromApp.isCleared;
          if (!transFromApp.isCleared)      transObject.isCleared       = false;
          if (transFromApp.isPlaceholder)   transObject.isPlaceholder   = transFromApp.isPlaceholder;
          if (!transFromApp.isPlaceholder)   transObject.isPlaceholder   = false;
          if (transFromApp.repeating)       transObject.repeating       = transFromApp.repeating;
      }
      return transObject;
  }


  return {
    findTransaction: findTransaction,
    updateTransaction: updateTransaction,
    createTransaction: createTransaction,
    findAllRecentTransactions: findAllRecentTransactions,
    deleteTransaction: deleteTransaction,
    calculateAccountBalance: calculateAccountBalance
  }
}

module.exports = controller;
