const mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:controller:user'),
    constructErrReturnObj = require('../common/moneyErrorObj'),
    tonksDEVUser = require('../models/tonksdevUserModel.js');

const controller = function(moneyApiVars) {
  'use strict';

  const findUser = function(uid, done) {
      tonksDEVUser.findById(uid, function(err, foundUser) {
          if (err || !foundUser) {
              done(constructErrReturnObj(err, 'could not find user', 404), null);
          } else {
              done(null, {'user': constructUserObjectForRead(foundUser)});
          }
      })
  }

  const findUserByEmail = function(ueml, done) {
      tonksDEVUser.findOne({'email': ueml}, function(err, foundUser) {
          if (err || !foundUser) {
              done(constructErrReturnObj(err, 'could not find user by email', 404), null);
          } else {
              done(null, {'user': constructUserObjectForRead(foundUser)});
          }
      })
  }

  const findAllUsers = function(done) {
      tonksDEVUser.find({}, function(err, foundUsers) {
        if (err || !foundUsers) {
            done(constructErrReturnObj(err, 'could not find any users', 404), null);
        } else {
            done(null, {'userList': constructUserList(foundUsers)});
        }
      })
  }

  const findAllUsersByGroupId = function(groupId, done) {
      tonksDEVUser.find({'groups': groupId}, function(err, foundUsers) {
        if (err || !foundUsers) {
            done(constructErrReturnObj(err, 'error retrieving users for group ' + groupId, 404), null);
        } else {
            done(null, {'userList': constructUserList(foundUsers)});
        }
      })
  }


  const createUser = function(reqBody, done) {
      if (reqBody.user.displayName && reqBody.user.email) {
        let newUser = constructUserObjectForSave(reqBody.user);
        newUser.save(function(err, savedUser) {
            if (err) {
              done(constructErrReturnObj(err, 'error saving new user', 500), {'saveStatus': 'failed create'});
            } else {
              done(null, {'saveStatus': 'created', 'user': constructUserObjectForRead(savedUser)});
            }
        });
      } else {
        done(constructErrReturnObj(null, 'displayName and email address were not supplied', 400), {'saveStatus': 'failed'});
      }
  }


  const updateUser = function(uid, reqBody, done) {
    if (uid && reqBody && reqBody.user) {
      tonksDEVUser.findById(uid, function(err, foundUser) {
          if (err || !foundUser) {
              done(constructErrReturnObj(err, 'user could not be found in the database', 404), {'saveStatus': 'failed update'});
          } else {
              let updatedUser = constructUserObjectForUpdate(foundUser, reqBody.user);
              updatedUser.save(function(err, savedUser) {
                  if (err) {
                    done(constructErrReturnObj(err, 'user record could not be updated in the database', 404), {'saveStatus': 'failed update'});
                  } else {
                    done(null, {'saveStatus': 'updated', 'user': constructUserObjectForRead(savedUser)});
                  }
              })
          }
      })
    } else {
      done(constructErrReturnObj(null, 'No user supplied, or no user ID was supplied', 400), null);
    }
  }

  const ensureUserIsInGroup = function(uid, gname, done) {
    if (uid && gname) {
      tonksDEVUser.update({_id: uid}, {$addToSet: {'groups': gname}}, null, function(err, numAffected) {
        if (err || numAffected === null || typeof numAffected === 'undefined' || numAffected.nModified < 0) {
          done(constructErrReturnObj(err, 'could not update accountGroup', 500), {'saveStatus': 'failed update', 'recordsUpdated': numAffected || -1});
        } else {
          if (numAffected.nModified === 0) {
            done(null, {'saveStatus': 'updated; warning: 0 records affected', 'recordsUpdated': numAffected});
          } else if (numAffected.nModified === 1) {
            done(null, {'saveStatus': 'updated', 'recordsUpdated': numAffected});
          } else {
            done(null, {'saveStatus': 'updated; warning: updated more than 1 account', 'recordsUpdated': numAffected});
          }
        }
      });
    }
  }


  const deleteUser = function(uid, done) {
    tonksDEVUser.findById(uid, function(err, foundUser) {
        if (err || !foundUser) {
            done(constructErrReturnObj(err, 'error finding requested user in the database', 404), {'saveStatus': 'failed delete'});
        } else {
            foundUser.remove(function(err) {
              if (err) {
                done(constructErrReturnObj(err, 'error removing user from the database', 404), {'saveStatus': 'failed delete'});
              } else {
                done(null, {'saveStatus': 'deleted'});
              }
            })
        }
    })
  }

  const constructUserObjectForRead = function(userFromDB) {
      let rtnUser = {};
      if (userFromDB) {
          rtnUser.id = userFromDB._id;
          rtnUser.displayName = userFromDB.displayName;
          rtnUser.email = userFromDB.email;
          rtnUser.image = userFromDB.image || '';
          rtnUser.payday = userFromDB.payday;
          rtnUser.biography = userFromDB.biography || '';
          rtnUser.joinDate = userFromDB.joinDate || '2016-01-01';
          rtnUser.groups = userFromDB.groups;
          rtnUser.links = {};
      }
      return rtnUser;
  }

  const constructUserList = function(userListFromDB) {
      let rtnUserList = [];
      if (userListFromDB && userListFromDB.length > 0) {
          userListFromDB.forEach(function(val, idx, arr) {
              rtnUserList.push(constructUserObjectForRead(val));
          })
      }
      return rtnUserList;
  }

  const constructUserObjectForSave = function(userFromApp) {
      let newUser = new tonksDEVUser;
      if (userFromApp) {
          newUser.displayName = userFromApp.displayName;
          newUser.email = userFromApp.email;
          newUser.image = userFromApp.image || '';
          newUser.payday = userFromApp.payday || 27;
          newUser.biography = userFromApp.biography || '';
          newUser.joinDate = userFromApp.joinDate || '2016-01-01';
          newUser.groups = userFromApp.groups || [];
          if (newUser.groups.indexOf('ALLUSERS') < 0) {
            newUser.groups.push('ALLUSERS');
          }
      }
      return newUser;
  }

  const constructUserObjectForUpdate = function(userObject, userFromApp) {
      if (userFromApp) {
          if (userFromApp.displayName) userObject.displayName = userFromApp.displayName;
          if (userFromApp.email) userObject.email = userFromApp.email;
          if (userFromApp.image) userObject.image = userFromApp.image;
          if (userFromApp.payday) userObject.payday = userFromApp.payday;
          if (userFromApp.payday) userObject.biography = userFromApp.biography;
          if (userFromApp.payday) userObject.joinDate = userFromApp.joinDate;
          if (userFromApp.groups) userObject.groups = userFromApp.groups;
          if (userObject.groups && userObject.groups.indexOf('ALLUSERS') < 0) {
            userObject.groups.push('ALLUSERS');
          }
      }
      return userObject;
  }

  return {
    findUser: findUser,
    findUserByEmail: findUserByEmail,
    findAllUsers: findAllUsers,
    findAllUsersByGroupId: findAllUsersByGroupId,
    createUser: createUser,
    updateUser: updateUser,
    deleteUser: deleteUser,
    ensureUserIsInGroup: ensureUserIsInGroup
  }
}

module.exports = controller;
