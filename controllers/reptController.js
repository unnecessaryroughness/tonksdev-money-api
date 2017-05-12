const mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:controller:repeating-trans'),
    constructErrReturnObj = require('../common/moneyErrorObj'),
    dateFormat = require("dateformat"),
    dateFuncs = require("../common/dateFunctions"),
    currencyFormat = require("currency-formatter"),
    repeating = require('../models/repeatingModel');

const controller = function(moneyApiVars) {
  'use strict';


  const findRepeating = function(rid, done) {
    if (rid == 0) {
      let newRept = new repeating;
      done(null, {'transaction': constructReptObjectForRead(newRept)});
    } else {
      repeating.findById(rid, function(err, foundRept) {
        if (err || !foundRept) {
          done(constructErrReturnObj(err, 'could not find repeating transaction', 404), null);
        } else {
          done(null, {'transaction': constructReptObjectForRead(foundRept)});
        }
      })
    }
  }


  const findRepeatingToDate = function(dte, done) {
    let dateDte = new Date(dte);
    repeating.find({'repeating.nextDate': {$lte: dateDte}, 'repeating.endOnDate': {$gte: dateDte}}, function(err, foundReptList) {
      if (err || !foundReptList) {
        done(constructErrReturnObj(err, 'could not find any repeating transactions', 404), null);
      } else {
        done(null, {'transactionList': constructReptObjectList(foundReptList)});
      }
    })
  }


  const createRepeating = function(reqBody, done) {
    let txn = reqBody.transaction || {};

    if ((txn.account  && txn.account.id && txn.account.group.id) &&
        (txn.payee    && (txn.payee.id || txn.payee.transferAccount.id)) &&
        (txn.category && txn.category.id) && (txn.amount)  &&
        (txn.repeating.nextDate && txn.repeating.endOnDate &&
          (txn.repeating.frequency && txn.repeating.frequency.code && txn.repeating.frequency.increment)) ) {

      let newRepeat = constructReptObjectForSave(reqBody.transaction);

      newRepeat.save(function(err, savedRepeat) {
          if (err) {
            done(constructErrReturnObj(err, 'error saving new repeating transaction', 500), {'saveStatus': 'failed create'});
          } else {
            done(null, {'transaction': savedRepeat, 'saveStatus': 'created'});
          }
      });
    } else {
      done(constructErrReturnObj(null, 'some mandatory fields were not supplied', 500), {'saveStatus': 'failed'});
    }
  }



  const updateRepeating = function(rid, reqBody, done) {
    if (rid && reqBody) {
      repeating.findById(rid, function(err, foundRepeat) {
        if (err || !foundRepeat) {
          done(constructErrReturnObj(err, 'repeating transaction could not be found in the database', 404), {'saveStatus': 'failed update'});
        } else {
          let updatedRepeat = constructReptObjectForUpdate(foundRepeat, reqBody.transaction);
          updatedRepeat.save(function(err, savedRepeat) {
            if (err) {
              done(constructErrReturnObj(err, 'repeating transaction record could not be updated in the database', 400), {'saveStatus': 'failed update'});
            } else {
              done(null, {'saveStatus': 'updated', 'transaction': constructReptObjectForRead(savedRepeat)});
            }
          })
        }
      });
    } else {
      done(constructErrReturnObj(null, 'mandatory fields were not supplied', 500), {'saveStatus': 'failed update'});
    }
  }


  const deleteRepeating = function(rid, done, recurse) {
    if (rid) {
      repeating.findById(rid, function(err, foundRepeat) {
        if (err || !foundRepeat) {
          done(constructErrReturnObj(err, 'repeating transaction could not be found in the database', 404), {'saveStatus': 'failed delete'});
        } else {
          foundRepeat.remove(function(err) {
            if (err) {
              done(constructErrReturnObj(err, 'error removing repeating transaction from database', 500), {'saveStatus': 'failed delete'});
            } else {
                done(null, {'saveStatus': 'deleted'});
            }
          })
        }
      });
    }
  }



  const constructReptObjectForRead = function(transFromDB) {
      let rtnTrans = {id: null};
      if (transFromDB) {
          rtnTrans.id             = transFromDB._id || transFromDB.id;
          rtnTrans.account        = transFromDB.account;
          rtnTrans.payee          = transFromDB.payee;
          rtnTrans.category       = transFromDB.category;
          rtnTrans.amount         = (transFromDB.amount) ? parseFloat(transFromDB.amount).toFixed(2) : 0.00;
          rtnTrans.transactionDate = dateFormat(transFromDB.transactionDate, "yyyy-mm-dd");
          rtnTrans.createdDate    = dateFormat(transFromDB.createdDate, "yyyy-mm-dd");
          rtnTrans.notes          = transFromDB.notes;
          rtnTrans.isCleared      = transFromDB.isCleared;
          rtnTrans.isPlaceholder  = transFromDB.isPlaceholder;
          rtnTrans.balance        = 0;
          rtnTrans.repeating      = transFromDB.repeating;

          let evalInc = transFromDB.repeating.frequency.increment;

          switch(transFromDB.repeating.frequency.code) {
            case "D":
              rtnTrans.repeating.frequency.description = "Every " + (evalInc > 1 ? evalInc + " Days" : "Day");
              break;
            case "W":
              rtnTrans.repeating.frequency.description = "Every " + (evalInc > 1 ? evalInc + " Weeks" : "Week");
              break;
            case "M":
              rtnTrans.repeating.frequency.description = "Every " + (evalInc > 1 ? evalInc + " Months" : "Month");
              break;
            case "Y":
              rtnTrans.repeating.frequency.description = "Every " + (evalInc > 1 ? evalInc + " Years" : "Year");
              break;
            default:
              rtnTrans.repeating.frequency.description = "Unknown";
              break;
          }
          rtnTrans.links = {};
      }
      return rtnTrans;
  }


  const constructReptObjectList = function(reptListFromDB) {
      let rtnReptList = [];
      if (reptListFromDB && reptListFromDB.length > 0) {
          reptListFromDB.forEach(function(val, idx, arr) {
              rtnReptList.push(constructReptObjectForRead(val));
          })
      }
      return rtnReptList;
  }



  const constructReptObjectForSave = function(transFromApp) {
      let newRept = new repeating;
      if (transFromApp) {
          newRept.account       = transFromApp.account;
          newRept.payee         = transFromApp.payee;
          newRept.category      = transFromApp.category;
          newRept.amount        = transFromApp.amount;
          newRept.transactionDate = transFromApp.transactionDate;
          newRept.notes         = transFromApp.notes;
          newRept.isCleared     = transFromApp.isCleared;
          newRept.isPlaceholder = transFromApp.isPlaceholder;
          newRept.repeating     = transFromApp.repeating;

          if (!newRept.payee.id) {
            newRept.payee.id = null;
          }
          if (!newRept.payee.transferAccount.id) {
            newRept.payee.transferAccount.id = null;
          }
      }
      return newRept;
  }

  const constructReptObjectForUpdate = function(transObject, transFromApp) {
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
          if (!transFromApp.isPlaceholder)  transObject.isPlaceholder   = transObject.isPlaceholder;
          if (transFromApp.repeating)       transObject.repeating       = transFromApp.repeating;
      }
      return transObject;
  }


  return {
    findRepeating: findRepeating,
    findRepeatingToDate: findRepeatingToDate,
    createRepeating: createRepeating,
    updateRepeating: updateRepeating,
    deleteRepeating: deleteRepeating
  }
}

module.exports = controller;
