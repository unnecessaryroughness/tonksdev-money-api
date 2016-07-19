const mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:controller:user'),
    tonksDEVUser = require('../models/tonksdevUserModel.js');

const controller = function(moneyApiVars) {
  'use strict';

  const stdErrMsg = 'User not found; error returned from database; controller is sending an error';
  let stdErrObj = {'userError': {}};

  const findUser = function(uid, done) {
      tonksDEVUser.findById(uid, function(err, foundUser) {
          if (err || !foundUser) {
              done(constructErrReturnObj(stdErrObj, err), null);
          } else {
              done(null, {'user': constructUserObjectForRead(foundUser)});
          }
      })
  }

  const findUserByEmail = function(ueml, done) {
      tonksDEVUser.findOne({'email': ueml}, function(err, foundUser) {
          if (err || !foundUser) {
              done(constructErrReturnObj(stdErrObj, err), null);
          } else {
              done(null, {'user': constructUserObjectForRead(foundUser)});
          }
      })
  }

  const findAllUsers = function(done) {
      tonksDEVUser.find({}, function(err, foundUsers) {
        if (err || !foundUsers) {
            done(constructErrReturnObj(stdErrObj, err), null);
        } else {
            done(null, {'userList': constructUserList(foundUsers)});
        }
      })
  }

  const findAllUsersByGroupId = function(groupId, done) {
      tonksDEVUser.find({'groups': groupId}, function(err, foundUsers) {
        if (err || !foundUsers) {
            done(constructErrReturnObj(stdErrObj, err, 'error retrieving users for group ' + groupId), null);
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
              done(constructErrReturnObj(stdErrObj, err, 'error saving new user'), {'saveStatus': 'failed create'});
            } else {
              done(null, {'saveStatus': 'created', 'user': constructUserObjectForRead(savedUser)});
            }
        });
      } else {
        done(constructErrReturnObj(stdErrObj, 'displayName and email address were not supplied'), {'saveStatus': 'failed'});
      }
  }


  const updateUser = function(uid, reqBody, done) {
    if (uid && reqBody && reqBody.user) {
      tonksDEVUser.findById(uid, function(err, foundUser) {
          if (err || !foundUser) {
              done(constructErrReturnObj(stdErrObj, err, 'user could not be found in the database'), {'saveStatus': 'failed update'});
          } else {
              let updatedUser = constructUserObjectForUpdate(foundUser, reqBody.user);
              updatedUser.save(function(err, savedUser) {
                  if (err) {
                    done(constructErrReturnObj(stdErrObj, err, 'user record could not be updated in the database'), {'saveStatus': 'failed update'});
                  } else {
                    done(null, {'saveStatus': 'updated', 'user': constructUserObjectForRead(savedUser)});
                  }
              })
          }
      })
    } else {
      done(constructErrReturnObj(stdErrObj, 'No user supplied, or no user ID was supplied'), null);
    }
  }


  const deleteUser = function(uid, done) {
    tonksDEVUser.findById(uid, function(err, foundUser) {
        if (err || !foundUser) {
            done(constructErrReturnObj(stdErrObj, err, 'error finding requested user in the database'), {'saveStatus': 'failed delete'});
        } else {
            foundUser.remove(function(err) {
              if (err) {
                done(constructErrReturnObj(stdErrObj, err, 'error removing user from the database'), {'saveStatus': 'failed delete'});
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

  const constructErrReturnObj = function(stubErr, actualErr, textErr) {
      stubErr.description = textErr;
      stubErr.userError = actualErr;
      return stubErr;
  }

  return {
    findUser: findUser,
    findUserByEmail: findUserByEmail,
    findAllUsers: findAllUsers,
    findAllUsersByGroupId: findAllUsersByGroupId,
    createUser: createUser,
    updateUser: updateUser,
    deleteUser: deleteUser
  }
}

module.exports = controller;
