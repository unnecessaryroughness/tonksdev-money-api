var debug = require('debug')('tonksDEV:money:api:routing'),
    debugM = require('debug')('tonksDEV:money:api:mongodb'),
    path = require('path'),
    express = require('express'),
    tonksDEVUser = require('../models/tonksdevUserModel.js');

var routes = function(moneyApiVars) {
    'use strict';

    var rootRouter = express.Router(),
        aytController = require('../controllers/aytController')(moneyApiVars);

    rootRouter.route('/')
        .get(function(req, res, next) {
            res.writeHead(200);
            res.end();
    });


    rootRouter.route('/ayt')
        .get(function(req, res, next) {
            aytController.aytData(function(err, data) {
              res.setHeader('Content-Type', 'application/json');
              if (!err) {
                debug("AYT data is: " + JSON.stringify(data));
                return res.status(200).json(data);
              } else {
                debug('AYT call failed');
                return res.status(400).json({'error': err});
              }
            });
        });


    return rootRouter;
};

module.exports = routes;
