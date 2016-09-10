const mongoose = require('mongoose'),
      debug = require('debug')('tonksDEV:money:api:controller:account'),
      account = require('../models/accountModel'),
      accountGroup = require('../models/accountGroupModel'),
      constructErrReturnObj = require('../common/moneyErrorObj'),
      dateFuncs = require('../common/dateFunctions')(),
      crypto = require('crypto');

const controller = function(moneyApiVars) {
  'use strict';


  const verifyEntitlement = function(userid, accGroupRecord, accGroupPW) {
    if (accGroupPW && !verifyAccountGroupPassword(accGroupRecord, accGroupPW)) {
      return false;
    }

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


  const deleteAccount = function(uid, acctid, accgpw, done) {
    if (uid && acctid && accgpw && done) {
      account.findById(acctid, function(err, foundAccount) {
          if (err || !foundAccount) {
            done(constructErrReturnObj(err, 'account record could not be found in the database', 404), {'saveStatus': 'failed remove; invalid account'});
          } else {
            //find account group
            findAccountGroup(uid, foundAccount.accountGroup, function(err, foundGroup) {
              if (err || !foundGroup) {
                done(constructErrReturnObj(err, 'could not find accountgroup for specified account', 403), {'saveStatus': 'failed remove; invalid accountgroup'});
              } else {
                //check password is ok
                if (!verifyAccountGroupPassword(foundGroup.accountGroup, accgpw)) {
                  done(constructErrReturnObj(err, 'accountgroup password is incorrect', 403), {'saveStatus': 'failed remove; incorrect password'});
                } else {
                  //remove account
                  foundAccount.remove(function(err) {
                    if (err) {
                      done(constructErrReturnObj(err, 'error removing account from database', 500), {'saveStatus': 'failed remove'});
                    } else {
                      done(null, {'saveStatus': 'deleted'});
                    }
                  })
                }
              }
            })
          }
      });
    } else {
      done(constructErrReturnObj(null, 'did not supply all required parameters', 500), {'saveStatus': 'failed remove; missing parameters'});
    }
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
          if (err) {
            if (err.name === 'CastError' && err.path === '_id') {
              accountGroup.find({"groupCode": groupid}, function(err, foundGroupList) {
                if (err || !foundGroupList) {
                  done(constructErrReturnObj(err, 'could not find the requested account group', 404), null);
                } else {
                  let foundGroup = foundGroupList[0];
                  if (verifyEntitlement(userid, foundGroup)) {
                    done(null, {'accountGroup': constructAcctGroupObjectForRead(foundGroup)});
                  } else {
                    done(constructErrReturnObj(err, 'permission denied', 403), null);
                  }
                }
              });
            } else {
              done(constructErrReturnObj(err, 'could not find the requested account group', 404), null);
            }
          } else {
            if (!foundGroup) {
              done(constructErrReturnObj(null, 'could not find the requested account group', 404), null);
            } else {
              if (verifyEntitlement(userid, foundGroup)) {
                done(null, {'accountGroup': constructAcctGroupObjectForRead(foundGroup)});
              } else {
                done(constructErrReturnObj(err, 'permission denied', 403), null);
              }
            }
          }
      });
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

  const updateAccountGroup = function(uid, accgid, accgpw, reqBody, done) {
    if (uid && accgid && reqBody) {
      accountGroup.findById(accgid, function(err, foundGroup) {
          if (err || !foundGroup) {
              done(constructErrReturnObj(err, 'accountgroup could not be found in the database', 404), {'saveStatus': 'failed update'});
          } else {
            //verify entitlement to update by checking if account is in an account group of which the user is a member
            if (verifyEntitlement(uid, foundGroup, accgpw)) {
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
    if (uid && accgid && accgpw && done) {
      accountGroup.findById(accgid, function(err, foundGroup) {
          if (err || !foundGroup) {
            done(constructErrReturnObj(err, 'accountgroup record could not be found in the database', 404), {'saveStatus': 'failed remove'});
          } else {
            //check password is ok
            if (!verifyAccountGroupPassword(foundGroup, accgpw)) {
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
    } else {
      done(constructErrReturnObj(null, 'did not supply all required parameters', 500), {'saveStatus': 'failed remove; missing parameters'});
    }
  }


  const changeAccountGroup = function(uid, acctid, accgid, done) {
      findAccountGroup(uid, accgid, function(err, foundGroup) {
          if (err || !foundGroup) {
            done(constructErrReturnObj(err, 'could not find accountgroup to update', 404), {'saveStatus': 'failed update; invalid accountgroup', 'recordsUpdated': 0});
          } else {
            //accountgroup exists... check account exists
            findAccount(uid, acctid, function(err, foundAccount) {
              if (err || !foundAccount) {
                done(constructErrReturnObj(err, 'could not find account to update', 404), {'saveStatus': 'failed update; invalid account', 'recordsUpdated': 0});
              } else {
                //update the account record
                account.update({'_id': acctid}, {$set: {'accountGroup': accgid}}, null, function(err, numAffected) {
                  if (err || numAffected === null || typeof numAffected === 'undefined' || numAffected < 0) {
                    done(constructErrReturnObj(err, 'could not update accountGroup', 500), {'saveStatus': 'failed update', 'recordsUpdated': numAffected || -1});
                  } else {
                    if (numAffected === 0) {
                      done(null, {'saveStatus': 'updated; warning: 0 records affected', 'recordsUpdated': numAffected});
                    } else if (numAffected === 1) {
                      done(null, {'saveStatus': 'updated', 'recordsUpdated': numAffected});
                    } else {
                      done(null, {'saveStatus': 'updated; warning: updated more than 1 account', 'recordsUpdated': numAffected});
                    }
                  }
                })
              }
            })
          }
      })
  }


  const changeAccountGroupPassword = function(uid, accgid, oldpw, newpw, done) {
      updateAccountGroup(uid, accgid, oldpw, {accountGroup: {password: newpw}}, function(err, data) {
          if (err || data.saveStatus !== 'updated') {
            done(constructErrReturnObj(err, 'could not change accountgroup password', 500), {'saveStatus': 'failed to update password'});
          } else {
            done(null, {'saveStatus': 'updated password'});
          }
      })
  };


  const genRandomString = function(length) {
    return crypto.randomBytes(Math.ceil(length/2)).toString('hex').slice(0, length);
  };

  const sha512 = function(password, salt) {
    var hash = crypto.createHmac('sha512', salt);
    hash.update(password);
    var value = hash.digest('hex');
    return {
      salt: salt,
      passwordHash: value
    };
  };


  const verifyAccountGroupPassword = function(accgDbObject, plainPW) {
      let comp1 = accgDbObject.password;
      let comp2 = sha512(plainPW, accgDbObject.passwordSalt).passwordHash;
      return (comp1 === comp2);
  };


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
          rtnAcctGroup.passwordSalt = acctGroupFromDB.passwordSalt;
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
        newGroup.passwordSalt = genRandomString(16);
        newGroup.password     = sha512(groupFromApp.password, newGroup.passwordSalt).passwordHash;
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
          if (accgFromApp.password) {
            accgObject.passwordSalt = genRandomString(16);
            accgObject.password     = sha512(accgFromApp.password, accgObject.passwordSalt).passwordHash;
          }
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
    deleteAccountGroup: deleteAccountGroup,
    deleteAccount: deleteAccount,
    changeAccountGroup: changeAccountGroup,
    changeAccountGroupPassword: changeAccountGroupPassword
  }
}

module.exports = controller;
