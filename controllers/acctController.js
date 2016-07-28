const mongoose = require('mongoose'),
      debug = require('debug')('tonksDEV:money:api:controller:account'),
      account = require('../models/accountModel'),
      accountGroup = require('../models/accountGroupModel');

const controller = function(moneyApiVars) {
  'use strict';

  // const findUser = function(uid, done) {
  //     tonksDEVUser.findById(uid, function(err, foundUser) {
  //         if (err || !foundUser) {
  //             done(constructErrReturnObj(stdErrObj, err), null);
  //         } else {
  //             done(null, {'user': constructUserObjectForRead(foundUser)});
  //         }
  //     })
  // }
  //
  // const findUserByEmail = function(ueml, done) {
  //     tonksDEVUser.findOne({'email': ueml}, function(err, foundUser) {
  //         if (err || !foundUser) {
  //             done(constructErrReturnObj(stdErrObj, err), null);
  //         } else {
  //             done(null, {'user': constructUserObjectForRead(foundUser)});
  //         }
  //     })
  // }
  //
  const findAllAccounts = function(done) {
      account.find({}, function(err, foundAccounts) {
        if (err || !foundAccounts) {
            done(constructErrReturnObj(err, 'could not find any account records'), null);
        } else {
            done(null, {'accountList': constructAccountList(foundAccounts)});
        }
      })
  }
  //
  // const findAllUsersByGroupId = function(groupId, done) {
  //     tonksDEVUser.find({'groups': groupId}, function(err, foundUsers) {
  //       if (err || !foundUsers) {
  //           done(constructErrReturnObj(stdErrObj, err, 'error retrieving users for group ' + groupId), null);
  //       } else {
  //           done(null, {'userList': constructUserList(foundUsers)});
  //       }
  //     })
  // }
  //
  //
  // const createUser = function(reqBody, done) {
  //     if (reqBody.user.displayName && reqBody.user.email) {
  //       let newUser = constructUserObjectForSave(reqBody.user);
  //       newUser.save(function(err, savedUser) {
  //           if (err) {
  //             done(constructErrReturnObj(stdErrObj, err, 'error saving new user'), {'saveStatus': 'failed create'});
  //           } else {
  //             done(null, {'saveStatus': 'created', 'user': constructUserObjectForRead(savedUser)});
  //           }
  //       });
  //     } else {
  //       done(constructErrReturnObj(stdErrObj, 'displayName and email address were not supplied'), {'saveStatus': 'failed'});
  //     }
  // }
  //
  //
  // const updateUser = function(uid, reqBody, done) {
  //   if (uid && reqBody && reqBody.user) {
  //     tonksDEVUser.findById(uid, function(err, foundUser) {
  //         if (err || !foundUser) {
  //             done(constructErrReturnObj(stdErrObj, err, 'user could not be found in the database'), {'saveStatus': 'failed update'});
  //         } else {
  //             let updatedUser = constructUserObjectForUpdate(foundUser, reqBody.user);
  //             updatedUser.save(function(err, savedUser) {
  //                 if (err) {
  //                   done(constructErrReturnObj(stdErrObj, err, 'user record could not be updated in the database'), {'saveStatus': 'failed update'});
  //                 } else {
  //                   done(null, {'saveStatus': 'updated', 'user': constructUserObjectForRead(savedUser)});
  //                 }
  //             })
  //         }
  //     })
  //   } else {
  //     done(constructErrReturnObj(stdErrObj, 'No user supplied, or no user ID was supplied'), null);
  //   }
  // }
  //
  //
  // const deleteUser = function(uid, done) {
  //   tonksDEVUser.findById(uid, function(err, foundUser) {
  //       if (err || !foundUser) {
  //           done(constructErrReturnObj(stdErrObj, err, 'error finding requested user in the database'), {'saveStatus': 'failed delete'});
  //       } else {
  //           foundUser.remove(function(err) {
  //             if (err) {
  //               done(constructErrReturnObj(stdErrObj, err, 'error removing user from the database'), {'saveStatus': 'failed delete'});
  //             } else {
  //               done(null, {'saveStatus': 'deleted'});
  //             }
  //           })
  //       }
  //   })
  // }
  //
  const constructAcctObjectForRead = function(acctFromDB) {
      let rtnAcct = {};
      if (acctFromDB) {
          rtnAcct.id = acctFromDB._id;
          rtnAcct.accountCode  = acctFromDB.accountCode;
          rtnAcct.accountName  = acctFromDB.accountName;
          rtnAcct.bankName     = acctFromDB.bankName;
          rtnAcct.accountGroup = acctFromDB.accountGroup;
          rtnAcct.balance      = acctFromDB.balance;
          rtnAcct.createdDate  = acctFromDB.createdDate;
          rtnAcct.links = {};
      }
      return rtnAcct;
  }

  const constructAccountList = function(acctListFromDB) {
      let rtnAcctList = [];
      if (acctListFromDB && acctListFromDB.length > 0) {
          acctListFromDB.forEach(function(val, idx, arr) {
              rtnAcctList.push(constructAcctObjectForRead(val));
          })
      }
      return rtnAcctList;
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

  const constructErrReturnObj = function(actualErr, textErr) {
      let stubErr = {acctError: {}};
      stubErr.acctError.description = textErr;
      stubErr.acctError.recdError = actualErr;
      return stubErr;
  }

  return {
    // findUser: findUser,
    // findUserByEmail: findUserByEmail,
    findAllAccounts: findAllAccounts
    // findAllUsersByGroupId: findAllUsersByGroupId,
    // createUser: createUser,
    // updateUser: updateUser,
    // deleteUser: deleteUser
  }
}

module.exports = controller;
