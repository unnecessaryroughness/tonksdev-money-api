const mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:controller:transaction'),
    constructErrReturnObj = require('../common/moneyErrorObj'),
    transaction = require('../models/transactionModel');

const controller = function(moneyApiVars) {
  'use strict';

  const findTransaction = function(tid, done) {
      transaction.findById(tid, function(err, foundTrans) {
          if (err || !foundTrans) {
              done(constructErrReturnObj(err, 'could not find transaction', 404), null);
          } else {
              done(null, {'payee': constructTransObjectForRead(foundTrans)});
          }
      })
  }


  const createTransaction = function(reqBody, done) {
    let txn = reqBody.transaction;
    if (txn.account.id && txn.account.group.id && (txn.payee.id || txn.payee.transferAccount.id) && txn.category.id && txn.amount) {
      let newTrans = constructTransObjectForSave(reqBody.transaction);
      newTrans.save(function(err, savedTrans) {
          if (err || !savedTrans) {
            done(constructErrReturnObj(err, 'error saving new transaction', 500), {'saveStatus': 'failed create'});
          } else {
            done(null, {'saveStatus': 'created', 'transaction': constructTransObjectForRead(savedTrans)});
          }
      });
    } else {
      done(constructErrReturnObj(null, 'mandatory fields were not supplied', 500), {'saveStatus': 'failed'});
    }
  }


  // const updatePayee = function(pid, reqBody, done) {
  //   if (pid && reqBody) {
  //     payee.findById(pid, function(err, foundPayee) {
  //       if (err || !foundPayee) {
  //         done(constructErrReturnObj(err, 'payee could not be found in the database', 404), {'saveStatus': 'failed update'});
  //       } else {
  //         let updatedPayee = constructPayeeObjectForUpdate(foundPayee, reqBody.payee);
  //         updatedPayee.save(function(err, savedPayee) {
  //             if (err) {
  //               done(constructErrReturnObj(err, 'payee record could not be updated in the database', 400), {'saveStatus': 'failed update'});
  //             } else {
  //               done(null, {'saveStatus': 'updated', 'payee': constructPayeeObjectForRead(savedPayee)});
  //             }
  //         })
  //       }
  //     });
  //   }
  // }


  // const deletePayee = function(pid, done) {
  //   if (pid) {
  //     payee.findById(pid, function(err, foundPayee) {
  //       if (err || !foundPayee) {
  //         done(constructErrReturnObj(err, 'payee could not be found in the database', 404), {'saveStatus': 'failed delete'});
  //       } else {
  //         foundPayee.remove(function(err) {
  //           if (err) {
  //             done(constructErrReturnObj(err, 'error removing payee from database', 500), {'saveStatus': 'failed delete'});
  //           } else {
  //             done(null, {'saveStatus': 'deleted'});
  //           }
  //         })
  //       }
  //     });
  //   }
  // }

  // const findAllPayees = function(acctGroup, done) {
  //     payee.find({'accountGroup': acctGroup}, function(err, foundPayees) {
  //       if (err || !foundPayees) {
  //           done(constructErrReturnObj(err, 'could not find any payees', 404), null);
  //       } else {
  //           done(null, {'payeeList': constructPayeeList(foundPayees)});
  //       }
  //     })
  // }




  const constructTransObjectForRead = function(transFromDB) {
      let rtnTrans = {id: null};
      if (transFromDB) {
          rtnTrans.id             = transFromDB._id;
          rtnTrans.account        = transFromDB.account;
          rtnTrans.payee          = transFromDB.payee;
          rtnTrans.category       = transFromDB.category;
          rtnTrans.amount         = transFromDB.amount;
          rtnTrans.createdDate    = transFromDB.createdDate;
          rtnTrans.notes          = transFromDB.notes;
          rtnTrans.isCleared      = transFromDB.isCleared;
          rtnTrans.isPlaceholder  = transFromDB.isPlaceholder;
          rtnTrans.repeating      = transFromDB.repeating;
          rtnTrans.links = {};
      }
      return rtnTrans;
  }


  // const constructPayeeList = function(payeeListFromDB) {
  //     let rtnPayeeList = [];
  //     if (payeeListFromDB && payeeListFromDB.length > 0) {
  //         payeeListFromDB.forEach(function(val, idx, arr) {
  //             rtnPayeeList.push(constructPayeeObjectForRead(val));
  //         })
  //     }
  //     return rtnPayeeList;
  // }

  const constructTransObjectForSave = function(transFromApp) {
      let newTrans = new transaction;
      if (transFromApp) {
          newTrans.account       = transFromApp.account;
          newTrans.payee         = transFromApp.payee;
          newTrans.category      = transFromApp.category;
          newTrans.amount        = transFromApp.amount;
          newTrans.createdDate   = transFromApp.createdDate;
          newTrans.notes         = transFromApp.notes;
          newTrans.isCleared     = transFromApp.isCleared;
          newTrans.isPlaceholder = transFromApp.isPlaceholder;
          newTrans.repeating     = transFromApp.repeating;
      }
      return newTrans;
  }

  // const constructPayeeObjectForUpdate = function(payeeObject, payeeFromApp) {
  //     if (payeeFromApp) {
  //         if (payeeFromApp.payeeName) payeeObject.payeeName = payeeFromApp.payeeName;
  //         if (payeeFromApp.accountGroup) payeeObject.accountGroup = payeeFromApp.accountGroup;
  //     }
  //     return payeeObject;
  // }


  return {
    findTransaction: findTransaction,
    // updatePayee: updatePayee,
    createTransaction: createTransaction
    // deletePayee: deletePayee,
    // findAllPayees: findAllPayees
  }
}

module.exports = controller;
