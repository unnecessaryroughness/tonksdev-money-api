const mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:aytController');

const controller = function(moneyApiVars) {
  'use strict';

  const aytData = function(done) {
      var readyStateMap = {
          '0': 'disconnected',
          '1': 'connected',
          '2': 'connecting',
          '3': 'disconnecting'
      }

      const rtnVal = {
          'application': 'API',
          'database': readyStateMap[mongoose.connection.readyState].toUpperCase(),
          'dbconnection': moneyApiVars.mongourl,
          'environment': moneyApiVars.environment.toUpperCase(),
          'ipport': moneyApiVars.ipaddress + ':' + moneyApiVars.port
      }
      done(null, rtnVal);
  }

  return {
    aytData: aytData
  }
}

module.exports = controller;
