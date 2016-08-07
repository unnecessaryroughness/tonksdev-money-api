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


  const updateAccount = function(uid, acctid, reqBody, done) {
    if (uid && acctid && reqBody) {
      account.findById(acctid, function(err, foundAccount) {
          if (err || !foundAccount) {
              done(constructErrReturnObj(err, 'account could not be found in the database', 404), {'saveStatus': 'failed update'});
          } else {
            //verify entitlement to update by checking if account is in an account group of which the user is a member
            accountGroup.findById(foundAccount.accountGroup, function(err, foundAG) {
              if (err || !foundAG) {
                done(constructErrReturnObj(err, 'could not find account group for requested account', 404), {'saveStatus': 'failed update'});
              } else {
                if (verifyEntitlement(uid, foundAG)) {
                  let updatedAccount = constructAcctObjectForUpdate(foundAccount, reqBody.account);
                  updatedAccount.save(function(err, savedAccount) {
                      if (err) {
                        done(constructErrReturnObj(err, 'account record could not be updated in the database', 400), {'saveStatus': 'failed update'});
                      } else {
                        done(null, {'saveStatus': 'updated', 'account': constructAcctObjectForRead(savedAccount)});
                      }
                  })
                } else {
                  done(constructErrReturnObj(err, 'permission denied', 403), null);
                }
              }
          })
        }
      })
    } else {
      done(constructErrReturnObj('No user ID was supplied, or no account id was supplied, or no account details were supplied', 400), null);
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

  const updateAccountGroup = function(uid, accgid, reqBody, done) {
    if (uid && accgid && reqBody) {
      accountGroup.findById(accgid, function(err, foundGroup) {
          if (err || !foundGroup) {
              done(constructErrReturnObj(err, 'accountgroup could not be found in the database', 404), {'saveStatus': 'failed update'});
          } else {
            //verify entitlement to update by checking if account is in an account group of which the user is a member
            if (verifyEntitlement(uid, foundGroup)) {
              let updatedGroup = constructAcctGroupObjectForUpdate(foundGroup, reqBody.accountGroup);
              updatedGroup.save(function(err, savedGroup) {
                  if (err || !savedGroup) {
                    done(constructErrReturnObj(err, 'accountgroup record could not be updated in the database', 400), {'saveStatus': 'failed update'});
                  } else {
                    done(null, {'saveStatus': 'updated', 'accountGroup': constructAcctGroupObjectForRead(savedGroup)});
                  }
              })
            } else {
              done(constructErrReturnObj(err, 'permission denied', 403), null);
            }
        }
      })
    } else {
      done(constructErrReturnObj('No user ID was supplied, or no accountgroup id was supplied, or no accountgroup details were supplied', 400), null);
    }
  }


  const deleteAccountGroup = function(uid, accgid, accgpw, done) {
    if (uid && accgid) {
      accountGroup.findById(accgid, function(err, foundGroup) {
          if (err || !foundGroup) {
            done(constructErrReturnObj(err, 'accountgroup record could not be found in the database', 404), {'saveStatus': 'failed remove'});
          } else {
            //check password is ok
            if (foundGroup.password !== accgpw) {
              done(constructErrReturnObj(err, 'accountgroup password is incorrect', 403), {'saveStatus': 'failed remove; incorrect password'});
            } else {
              //check account group is empty
              findAllAccountsInGroup(uid, accgid, function(err, foundAccounts) {
                if (!err && foundAccounts.accountList.length > 0) {
                  done(constructErrReturnObj(err, 'accountgroup is not empty, so cannot be deleted', 500), {'saveStatus': 'failed remove; group not empty'});
                } else {
                  foundGroup.remove(function(err) {
                    if (err) {
                      done(constructErrReturnObj(err, 'error removing accountgroup from database', 500), {'saveStatus': 'failed remove'});
                    } else {
                      done(null, {'saveStatus': 'deleted'});
                    }
                  })
                }
              });
            }
          }
      });
    }
  }



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


  const constructAcctObjectForUpdate = function(acctObject, acctFromApp) {
      if (acctFromApp) {
          if (acctFromApp.accountCode)  acctObject.accountCode  = acctFromApp.accountCode;
          if (acctFromApp.accountName)  acctObject.accountName  = acctFromApp.accountName;
          if (acctFromApp.bankName)     acctObject.bankName     = acctFromApp.bankName;
          if (acctFromApp.accountGroup) acctObject.accountGroup = acctFromApp.accountGroup;
          if (acctFromApp.balance)      acctObject.balance      = acctFromApp.balance;
      }
      return acctObject;
  }


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

  const constructAcctGroupObjectForUpdate = function(accgObject, accgFromApp) {
      if (accgFromApp) {
          if (accgFromApp.groupCode)    accgObject.groupCode    = accgFromApp.groupCode;
          if (accgFromApp.description)  accgObject.description  = accgFromApp.description;
          if (accgFromApp.owner)        accgObject.owner        = accgFromApp.owner;
          if (accgFromApp.members)      accgObject.members      = accgFromApp.members;
          if (accgFromApp.password)     accgObject.password     = accgFromApp.password;
      }
      return accgObject;
  }

  return {
    findAccount: findAccount,
    findAllAccounts: findAllAccounts,
    findAllAccountGroups: findAllAccountGroups,
    findAccountGroup: findAccountGroup,
    findAllAccountsInGroup: findAllAccountsInGroup,
    createAccount: createAccount,
    createAccountGroup: createAccountGroup,
    updateAccount: updateAccount,
    updateAccountGroup: updateAccountGroup,
    deleteAccountGroup: deleteAccountGroup
  }
}

module.exports = controller;
