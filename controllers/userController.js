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
              debug(stdErrMsg);
              stdErrObj.userError = err;
              done(stdErrObj, null);
          } else {
              debug('User ' + uid + ' found - ' + JSON.stringify(foundUser) + '; controller is sending user data');
              done(null, constructUserObject(foundUser));
          }
      })
  }

  const findUserByEmail = function(ueml, done) {
      tonksDEVUser.findOne({'email': ueml}, function(err, foundUser) {
          if (err || !foundUser) {
              debug(stdErrMsg);
              stdErrObj.userError = err;
              done(stdErrObj, null);
          } else {
              debug('User ' + ueml + ' found - ' + JSON.stringify(foundUser) + '; controller is sending user data');
              done(null, constructUserObject(foundUser));
          }
      })
  }

  const findAllUsers = function(done) {
      tonksDEVUser.find({}, function(err, foundUsers) {
        if (err || !foundUsers) {
            debug(stdErrMsg);
            stdErrObj.userError = err;
            done(stdErrObj, null);
        } else {
            debug(foundUsers.length + ' Users found');
            done(null, constructUserList(foundUsers));
        }
      })
  }


  const createUser = function(reqBody, done) {
      if (reqBody.displayName && reqBody.email) {
        let newUser = constructUserObjectForDB(reqBody);
        newUser.save(function(err) {
            if (err) {
              stdErrObj.userError = err;
              done(stdErrObj, {"saveStatus": "failed"});
            } else {
              done(null, {"saveStatus": "saved"});
            }
        });
      } else {
        stdErrObj.userError = "displayName and email address were not supplied";
        done(stdErrObj, {"saveStatus": "failed"});
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

  const constructUserObjectForDB = function(userFromApp) {
      let newUser = new tonksDEVUser;
      if (userFromApp) {
          newUser.displayName = userFromApp.displayName;
          newUser.email = userFromApp.email;
          newUser.image = userFromApp.image || "";
          newUser.groups = userFromApp.groups || [];
      }
      return newUser;
  }

  return {
    findUser: findUser,
    findUserByEmail: findUserByEmail,
    findAllUsers: findAllUsers,
    createUser: createUser
  }
}

module.exports = controller;
