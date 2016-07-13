const mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:controller:user'),
    tonksDEVUser = require('../models/tonksdevUserModel.js');

const controller = function(moneyApiVars) {
  'use strict';

  const stdErrMsg = 'User not found; error returned from database; controller is sending an error';

  const findUser = function(uid, done) {
      tonksDEVUser.findById(uid, function(err, foundUser) {
          if (err || !foundUser) {
              debug(stdErrMsg);
              done(err, null);
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
              done(err, null);
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
            done(err, null);
        } else {
            debug(foundUsers.length + ' Users found');
            done(null, constructUserList(foundUsers));
        }
      })
  }


  const constructUserObject = function(userFromDB) {
      let rtnUser = {};
      if (userFromDB) {
          rtnUser.id = userFromDB._id;
          rtnUser.displayName = userFromDB.displayName;
          rtnUser.email = userFromDB.email;
          rtnUser.image = userFromDB.image || '';
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

  return {
    findUser: findUser,
    findUserByEmail: findUserByEmail,
    findAllUsers: findAllUsers
  }
}

module.exports = controller;
