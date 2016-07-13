const express      = require('express'),
      bodyParser   = require('body-parser'),
      cookieParser = require('cookie-parser'),
      path         = require('path'),
      debug        = require('debug')('tonksDEV:money:api:server'),
      mongoose     = require('mongoose')

//Define the application object
const MoneyApi = function() {
    'use strict';

    let self = this;
    self.helperFunctions = require('./helperFunctions')(self);

    //Initialize the server (express)
    self.initializeServer = function() {

        //setup the web server app
            self.app = express();
            self.app.use(bodyParser.urlencoded({extended:true}));
            self.app.use(bodyParser.json());
            self.app.use(cookieParser());
            self.app.use(express.static('public'));
            self.app.set('trust proxy', 1);
            self.variables.environment = self.app.get('env');

        //set up connection to mongodb - mongoose creates a singleton object, so it will stay connected
            self.mongoose = mongoose;

            mongoose.connection.on('open', function() {
                debug('Connected to Mongo server');
            });

            mongoose.connection.on('error', function(err) {
                debug('Could not connect to Mongo server');
                debug(err);
            });

            self.mongoose.connect(self.variables.mongourl);
            debug('connecting to database: ' + self.variables.mongourl);


        //use predefined routers
            let rootRouter = require('../routers/rootRoutes')(self.variables);
            let userRouter = require('../routers/userRoutes')(self.variables);
            self.app.use('/', rootRouter);
            self.app.use('/user', userRouter);


        //default error handler - throw 404
            self.app.use(function(req, res, next) {
                let err = new Error('Not Found');
                err.status = 404;
                next(err);
            });

        debug('environment: ' + self.variables.environment);

        //development error handler - show stack trace
            if (self.variables.environment === 'development') {
                self.app.use(function(err, req, res, next) {
                    res.status(err.status || 500);
                    debug('debug error: ' + err.message + ' / ' + err);
                    res.end();
                });
            }

        //production error handler - hide stack trace
            self.app.use(function(err, req, res, next) {
                res.status(err.status || 500);
                debug('error: ' + err.message + ' / ' + err);
                res.end();
            });
    };


    //Perform application setup functions
    self.initialize = function() {
        debug('setting up variables...');
        self.helperFunctions.setupVariables();
        debug('setting up termination handlers...');
        self.helperFunctions.setupTerminationHandlers();
        debug('initializing server...');
        self.initializeServer();
    };


    //Start the server (starts up the sample application).
    self.start = function() {
        debug('attempting to start server on %s:%d', self.variables.ipaddress, self.variables.port);

        self.app.listen(self.variables.port, self.variables.ipaddress, function() {
            debug('%s: tonksDEV Money Node server started on %s:%d ...',
                        Date(Date.now() ), self.variables.ipaddress, self.variables.port);
        });
    };

};

module.exports = MoneyApi;
