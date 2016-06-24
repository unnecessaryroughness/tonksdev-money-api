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


    //handle request to "are you there?"
    rootRouter.route('/ayt')
        .get(aytController.ayt);

    return rootRouter;
};

module.exports = routes;
