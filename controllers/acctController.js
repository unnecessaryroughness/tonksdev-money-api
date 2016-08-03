const mongoose = require('mongoose'),
      debug = require('debug')('tonksDEV:money:api:controller:account'),
      account = require('../models/accountModel'),
      accountGroup = require('../models/accountGroupModel'),
      constructErrReturnObj = require('../common/moneyErrorObj'),
      dateFuncs = require('../common/dateFunctions')();

const controller = function(moneyApiVars) {
  'use strict';

  const verifyEntitlement = function(userid, accGroupRecord) {
    let rtnVal = false;
    if (userid && accGroupRecord) {
      accGroupRecord.members.forEach(function(member, idx, list) {
        if (member == userid) {
          rtnVal = true;
        }
      });
    } else {
      rtnVal = false;
    }
    return rtnVal;
  }


  const findAllAccounts = function(userid, done) {
      findAllAccountGroups(userid, function(err, acctGroupData) {
        if (err || !acctGroupData) {
          done(constructErrReturnObj(err, 'could not find any account records (no groups)', 404), null);
        } else {
          let agList = [];
          acctGroupData.accountGroupList.forEach(function(ag, idx, list) {
            agList.push(ag.id);
          })
          account.find({accountGroup: {$in: agList}}, function(err, foundAccounts) {
            if (err || !foundAccounts) {
              done(constructErrReturnObj(err, 'could not find any account records', 404), null);
            } else {
              done(null, {'accountList': constructAccountList(foundAccounts)});
            }
          })
        }
      })
  }


  const findAccount = function(userid, acctid, done) {
      account.findById(acctid, function(err, foundAccount) {
          if (err || !foundAccount) {
              done(constructErrReturnObj(err, 'could not find the requested account', 404), null);
          } else {
              accountGroup.findById(foundAccount.accountGroup, function(err, foundAG) {
                if (verifyEntitlement(userid, foundAG)) {
                  done(null, {'account': constructAcctObjectForRead(foundAccount)});
                } else {
                  done(constructErrReturnObj(err, 'permission denied', 403), null);
                }
              })
          }
      })
  }


  const findAllAccountGroups = function(userid, done) {
      accountGroup.find({"members": userid}, function(err, foundGroups) {
        if (err || !foundGroups) {
          done(constructErrReturnObj(err, 'user is not a member of any groups', 404), null);
        } else {
          done(null, {'accountGroupList': constructAccountGroupList(foundGroups)});
        }
      })
  }


  const findAccountGroup = function(userid, groupid, done) {
      accountGroup.findById(groupid, function(err, foundGroup) {
          if (err || !foundGroup) {
              done(constructErrReturnObj(err, 'could not find the requested account group', 404), null);
          } else {
              if (verifyEntitlement(userid, foundGroup)) {
                done(null, {'accountGroup': constructAcctGroupObjectForRead(foundGroup)});
              } else {
                done(constructErrReturnObj(err, 'permission denied', 403), null);
              }
          }
      })
  }

  const findAllAccountsInGroup = function(userid, groupid, done) {
      findAccountGroup(userid, groupid, function(err, foundGroup) {
          if (err || !foundGroup) {
            done(constructErrReturnObj(err, 'could not find the requested account group', 404), null);
          } else {
            account.find({accountGroup: foundGroup.accountGroup.id}, function(err, foundAccounts) {
              if (err || !foundAccounts) {
                done(constructErrReturnObj(err, 'could not find any account records in requested group', 404), null);
              } else {
                done(null, {'accountList': constructAccountList(foundAccounts)});
              }
            })
          }
      })
  }

  const createAccount = function(reqBody, done) {
      if (reqBody.account.accountCode && reqBody.account.accountGroup) {
        let newAcct = constructAcctObjectForSave(reqBody.account);
        newAcct.save(function(err, savedAcct) {
            if (err) {
              done(constructErrReturnObj(err, 'error saving new account', 500), {'saveStatus': 'failed create'});
            } else {
              done(null, {'saveStatus': 'created', 'account': constructAcctObjectForRead(savedAcct)});
            }
        });
      } else {
        done(constructErrReturnObj(null, 'accountCode and accountGroup were not supplied', 500), {'saveStatus': 'failed'});
      }
  }

  const createAccountGroup = function(reqBody, done) {
      if (reqBody.accountGroup.groupCode && reqBody.accountGroup.owner && reqBody.accountGroup.password) {
        let newGroup = constructAcctGroupObjectForSave(reqBody.accountGroup);
        newGroup.save(function(err, savedGroup) {
            if (err) {
              done(constructErrReturnObj(err, 'error saving new account group', 500), {'saveStatus': 'failed create'});
            } else {
              done(null, {'saveStatus': 'created', 'accountGroup': constructAcctGroupObjectForRead(savedGroup)});
            }
        });
      } else {
        done(constructErrReturnObj(null, 'groupCode, groupOwner and password were not supplied', 500), {'saveStatus': 'failed'});
      }
  }

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

  const constructAcctObjectForSave = function(acctFromApp) {
    let newAcct = new account;
    if (acctFromApp) {
        newAcct.accountCode = acctFromApp.accountCode;
        newAcct.accountName = acctFromApp.accountName || 'Unnamed account';
        newAcct.bankName    = acctFromApp.bankName || 'Unnamed bank';
        newAcct.accountGroup = acctFromApp.accountGroup;
        newAcct.balance     = acctFromApp.balance || 0.00;
        newAcct.createdDate = acctFromApp.createdDate || dateFuncs.getTodaysDateYMD();
    }
    return newAcct;
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


  const constructAcctGroupObjectForRead = function(acctGroupFromDB) {
      let rtnAcctGroup = {};
      if (acctGroupFromDB) {
          rtnAcctGroup.id           = acctGroupFromDB._id;
          rtnAcctGroup.groupCode    = acctGroupFromDB.groupCode;
          rtnAcctGroup.description  = acctGroupFromDB.description;
          rtnAcctGroup.owner        = acctGroupFromDB.owner;
          rtnAcctGroup.members      = acctGroupFromDB.members;
          rtnAcctGroup.password     = acctGroupFromDB.password;
          rtnAcctGroup.createdDate  = acctGroupFromDB.createdDate;
          rtnAcctGroup.links = {};
      }
      return rtnAcctGroup;
  }

  const constructAccountGroupList = function(acctGroupListFromDB) {
      let rtnAcctGroupList = [];
      if (acctGroupListFromDB && acctGroupListFromDB.length > 0) {
          acctGroupListFromDB.forEach(function(acctGroup, idx, arr) {
              rtnAcctGroupList.push(constructAcctGroupObjectForRead(acctGroup));
          })
      }
      return rtnAcctGroupList;
  }

  const constructAcctGroupObjectForSave = function(groupFromApp) {
    let newGroup = new accountGroup;
    if (groupFromApp) {
        newGroup.groupCode    = groupFromApp.groupCode;
        newGroup.description  = groupFromApp.description || 'Unnamed account group';
        newGroup.owner        = groupFromApp.owner;
        newGroup.members      = groupFromApp.members || [groupFromApp.owner];
        newGroup.password     = groupFromApp.password;
        newGroup.createdDate  = groupFromApp.createdDate || dateFuncs.getTodaysDateYMD();
    }
    return newGroup;
  }


  return {
    findAccount: findAccount,
    findAllAccounts: findAllAccounts,
    findAllAccountGroups: findAllAccountGroups,
    findAccountGroup: findAccountGroup,
    findAllAccountsInGroup: findAllAccountsInGroup,
    createAccount: createAccount,
    createAccountGroup: createAccountGroup
  }
}

module.exports = controller;
