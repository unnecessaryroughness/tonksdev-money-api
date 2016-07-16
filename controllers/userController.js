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
              stdErrObj.userError = err;
              done(stdErrObj, null);
          } else {
              done(null, {'user': constructUserObject(foundUser)});
          }
      })
  }

  const findUserByEmail = function(ueml, done) {
      tonksDEVUser.findOne({'email': ueml}, function(err, foundUser) {
          if (err || !foundUser) {
              stdErrObj.userError = err;
              done(stdErrObj, null);
          } else {
              done(null, {'user': constructUserObject(foundUser)});
          }
      })
  }

  const findAllUsers = function(done) {
      tonksDEVUser.find({}, function(err, foundUsers) {
        if (err || !foundUsers) {
            stdErrObj.userError = err;
            done(stdErrObj, null);
        } else {
            done(null, {'userList': constructUserList(foundUsers)});
        }
      })
  }


  const createUser = function(reqBody, done) {
    debug("in create routine");
      if (reqBody.user.displayName && reqBody.user.email) {
        let newUser = constructUserObjectForSave(reqBody.user);
        newUser.save(function(err, savedUser) {
            if (err) {
              stdErrObj.userError = err;
              done(stdErrObj, {'saveStatus': 'failed create'});
            } else {
              done(null, {'saveStatus': 'created', 'user': constructUserObject(savedUser)});
            }
        });
      } else {
        stdErrObj.userError = 'displayName and email address were not supplied';
        done(stdErrObj, {'saveStatus': 'failed'});
      }
  }


  const updateUser = function(reqBody, done) {
    debug("in update routine");
    if (reqBody && reqBody.user && reqBody.user.id) {
      tonksDEVUser.findById(reqBody.user.id, function(err, foundUser) {
          if (err || !foundUser) {
              stdErrObj.userError = err;
              done(stdErrObj, null);
          } else {
              let updateUser = constructUserObjectForUpdate(foundUser, reqBody.user);
              updateUser.save(function(err, savedUser) {
                  if (err) {
                    stdErrObj.userError = err;
                    done(stdErrObj, {'saveStatus': 'failed update'});
                  } else {
                    done(null, {'saveStatus': 'updated', 'user': constructUserObject(savedUser)});
                  }
              })
          }
      })
    } else {
      stdErrObj.userError = 'No user supplied, or a user with no ID was supplied';
      done(stdErrObj, null);
    }
  }


  const constructUserObject = function(userFromDB) {
      let rtnUser = {};
      if (userFromDB) {
          rtnUser.id = userFromDB._id;
          rtnUser.displayName = userFromDB.displayName;
          rtnUser.email = userFromDB.email;
          rtnUser.image = userFromDB.image || '';
          rtnUser.groups = userFromDB.groups;
          rtnUser.links = {};
      }
      return rtnUser;
  }

  const constructUserList = function(userListFromDB) {
      let rtnUserList = [];
      if (userListFromDB && userListFromDB.length > 0) {
          userListFromDB.forEach(function(val, idx, arr) {
              rtnUserList.push(constructUserObject(val));
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
          newUser.groups = userFromApp.groups || [];
          if (newUser.groups.indexOf('ALL USERS') < 0) {
            newUser.groups.push('ALL USERS');
          }
      }
      return newUser;
  }

  const constructUserObjectForUpdate = function(userObject, userFromApp) {
      if (userFromApp) {
          if (userFromApp.displayName) userObject.displayName = userFromApp.displayName;
          if (userFromApp.email) userObject.email = userFromApp.email;
          if (userFromApp.image) userObject.image = userFromApp.image;
          if (userFromApp.groups) userObject.groups = userFromApp.groups;
          if (userObject.groups.indexOf('ALL USERS') < 0) {
            userObject.groups.push('ALL USERS');
          }
      }
      return userObject;
  }


  return {
    findUser: findUser,
    findUserByEmail: findUserByEmail,
    findAllUsers: findAllUsers,
    createUser: createUser,
    updateUser: updateUser
  }
}

module.exports = controller;
