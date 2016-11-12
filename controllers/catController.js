const mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:controller:category'),
    constructErrReturnObj = require('../common/moneyErrorObj'),
    category = require('../models/categoryModel');

const controller = function(moneyApiVars) {
  'use strict';

  // const findUser = function(uid, done) {
  //     tonksDEVUser.findById(uid, function(err, foundUser) {
  //         if (err || !foundUser) {
  //             done(constructErrReturnObj(err, 'could not find user', 404), null);
  //         } else {
  //             done(null, {'user': constructUserObjectForRead(foundUser)});
  //         }
  //     })
  // }

  const findAllCategories = function(acctGroup, done) {
      category.find({'accountGroup': acctGroup}, function(err, foundCategories) {
        if (err || !foundCategories) {
            done(constructErrReturnObj(err, 'could not find any categories', 404), null);
        } else {
            done(null, {'categoryList': constructCategoryList(foundCategories)});
        }
      })
  }


  const constructCategoryObjectForRead = function(catFromDB) {
      let rtnCat = {id: null};
      if (catFromDB) {
          rtnCat.id = catFromDB._id;
          rtnCat.categoryName = catFromDB.categoryName;
          rtnCat.accountGroup = catFromDB.accountGroup;
          rtnCat.links = {};
      }
      return rtnCat;
  }

  const constructCategoryList = function(catListFromDB) {
      let rtnCatList = [];
      if (catListFromDB && catListFromDB.length > 0) {
          catListFromDB.forEach(function(val, idx, arr) {
              rtnCatList.push(constructCategoryObjectForRead(val));
          })
      }
      return rtnCatList;
  }

  // const constructUserObjectForSave = function(userFromApp) {
  //     let newUser = new tonksDEVUser;
  //     if (userFromApp) {
  //         newUser.displayName = userFromApp.displayName;
  //         newUser.email = userFromApp.email;
  //         newUser.image = userFromApp.image || '';
  //         newUser.payday = userFromApp.payday || 27;
  //         newUser.biography = userFromApp.biography || '';
  //         newUser.joinDate = userFromApp.joinDate || '2016-01-01';
  //         newUser.groups = userFromApp.groups || [];
  //         if (newUser.groups.indexOf('ALLUSERS') < 0) {
  //           newUser.groups.push('ALLUSERS');
  //         }
  //     }
  //     return newUser;
  // }
  //
  // const constructUserObjectForUpdate = function(userObject, userFromApp) {
  //     if (userFromApp) {
  //         if (userFromApp.displayName) userObject.displayName = userFromApp.displayName;
  //         if (userFromApp.email) userObject.email = userFromApp.email;
  //         if (userFromApp.image) userObject.image = userFromApp.image;
  //         if (userFromApp.payday) userObject.payday = userFromApp.payday;
  //         if (userFromApp.payday) userObject.biography = userFromApp.biography;
  //         if (userFromApp.payday) userObject.joinDate = userFromApp.joinDate;
  //         if (userFromApp.groups) userObject.groups = userFromApp.groups;
  //         if (userObject.groups && userObject.groups.indexOf('ALLUSERS') < 0) {
  //           userObject.groups.push('ALLUSERS');
  //         }
  //     }
  //     return userObject;
  // }


  return {
    // findUser: findUser,
    findAllCategories: findAllCategories
  }
}

module.exports = controller;
