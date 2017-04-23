const mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:controller:repeating-trans'),
    constructErrReturnObj = require('../common/moneyErrorObj'),
    dateFormat = require("dateformat"),
    dateFuncs = require("../common/dateFunctions"),
    currencyFormat = require("currency-formatter"),
    repeating = require('../models/repeatingModel');

const controller = function(moneyApiVars) {
  'use strict';

  // const findCategory = function(cid, done) {
  //     category.findById(cid, function(err, foundCategory) {
  //         if (err || !foundCategory) {
  //             done(constructErrReturnObj(err, 'could not find category', 404), null);
  //         } else {
  //             done(null, {'category': constructCategoryObjectForRead(foundCategory)});
  //         }
  //     })
  // }

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


  // const updateCategory = function(cid, reqBody, done) {
  //   if (cid && reqBody) {
  //     category.findById(cid, function(err, foundCategory) {
  //       if (err || !foundCategory) {
  //         done(constructErrReturnObj(err, 'category could not be found in the database', 404), {'saveStatus': 'failed update'});
  //       } else {
  //         let updatedCategory = constructCategoryObjectForUpdate(foundCategory, reqBody.category);
  //         updatedCategory.save(function(err, savedCategory) {
  //             if (err) {
  //               done(constructErrReturnObj(err, 'category record could not be updated in the database', 400), {'saveStatus': 'failed update'});
  //             } else {
  //               done(null, {'saveStatus': 'updated', 'category': constructCategoryObjectForRead(savedCategory)});
  //             }
  //         })
  //       }
  //     });
  //   }
  // }


  // const deleteCategory = function(cid, done) {
  //   if (cid) {
  //     category.findById(cid, function(err, foundCategory) {
  //       if (err || !foundCategory) {
  //         done(constructErrReturnObj(err, 'category could not be found in the database', 404), {'saveStatus': 'failed delete'});
  //       } else {
  //         foundCategory.remove(function(err) {
  //           if (err) {
  //             done(constructErrReturnObj(err, 'error removing category from database', 500), {'saveStatus': 'failed delete'});
  //           } else {
  //             done(null, {'saveStatus': 'deleted'});
  //           }
  //         })
  //       }
  //     });
  //   }
  // }


  // const findAllCategories = function(acctGroup, done) {
  //     category.find({'accountGroup': acctGroup}, null, {sort: {categoryName: 1}}, function(err, foundCategories) {
  //       if (err || !foundCategories) {
  //           done(constructErrReturnObj(err, 'could not find any categories', 404), null);
  //       } else {
  //           done(null, {'categoryList': constructCategoryList(foundCategories)});
  //       }
  //     })
  // }


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
          rtnTrans.links = {};
      }
      return rtnTrans;
  }


  // const constructCategoryList = function(catListFromDB) {
  //     let rtnCatList = [];
  //     if (catListFromDB && catListFromDB.length > 0) {
  //         catListFromDB.forEach(function(val, idx, arr) {
  //             rtnCatList.push(constructCategoryObjectForRead(val));
  //         })
  //     }
  //     return rtnCatList;
  // }


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


  // const constructCategoryObjectForUpdate = function(categoryObject, categoryFromApp) {
  //     if (categoryFromApp) {
  //         if (categoryFromApp.categoryName) categoryObject.categoryName = categoryFromApp.categoryName;
  //         if (categoryFromApp.accountGroup) categoryObject.accountGroup = categoryFromApp.accountGroup;
  //     }
  //     return categoryObject;
  // }


  return {
    findRepeating: findRepeating,
    // updateCategory: updateCategory,
    createRepeating: createRepeating
    // deleteCategory: deleteCategory,
    // findAllCategories: findAllCategories
  }
}

module.exports = controller;
