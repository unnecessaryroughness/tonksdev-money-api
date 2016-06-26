var mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:aytController');

var controller = function(moneyApiVars) {
  'use strict';

  var ayt = function(req, res) {

      var readyStateMap = {
          '0': 'disconnected',
          '1': 'connected',
          '2': 'connecting',
          '3': 'disconnecting'
      }

      var rtnVal = {
          'application': 'API',
          'database': readyStateMap[mongoose.connection.readyState].toUpperCase(),
          'db-connection': moneyApiVars.mongourl,
          'environment': moneyApiVars.environment.toUpperCase(),
          'ip-port': moneyApiVars.ipaddress + ':' + moneyApiVars.port
      }
      return res.status(200).json(rtnVal);
  }

  return {
    ayt: ayt
  }
}

module.exports = controller;
