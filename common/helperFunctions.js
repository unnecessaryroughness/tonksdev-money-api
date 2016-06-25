var debug = require('debug')('tonksDEV:money:api:helpers'),
    debugT = require('debug')('tonksDEV:money:api:term:handlers');

function helpers(moneyApp) {
    'use strict';

    var self = moneyApp;
    moneyApp.variables = {};

    //Set up server IP address and port # using env variables/defaults.
    var setupVariables = function() {
        debug('process.env.IP is: ' + process.env.IP);
        debug('process.env.PORT is: ' + process.env.PORT);

        // moneyApp.variables.ipaddress = process.env.IP || '127.0.0.1';
        moneyApp.variables.ipaddress = process.env.IP || '0.0.0.0';
        moneyApp.variables.port      = process.env.PORT || 8080;
        moneyApp.variables.mongourl = (process.env.MONEYDB_PORT_27017_TCP_ADDR)
                               ? process.env.MONEYDB_PORT_27017_TCP_ADDR+':'+process.env.MONEYDB_PORT_27017_TCP_PORT + '/'
                               : 'mongodb://172.17.0.2:27017/';
        moneyApp.variables.mongourl  += 'money?authSource=admin';
    };

    // terminator === the termination handler
    // Terminate server on receipt of the specified signal.
    // @param {string} sig  Signal to terminate on.
    var terminator = function(sig){
        if (typeof sig === 'string') {
           debugT('%s: Received %s - terminating tonksDEV Money app ...',
                       Date(Date.now()), sig);

          //close the mongoose connection, if open
           if (typeof moneyApp.mongoose != 'undefined' && moneyApp.mongoose.connection.readyState != 0) {
              debugT('closing connection to mongodb...');
              moneyApp.mongoose.connection.close();
           }
           process.exit(1);
        }
        debugT('%s: Node server stopped.', Date(Date.now()) );
    };

    // Setup termination handlers (for exit and a list of signals).
    var setupTerminationHandlers = function(){

        //  Process on exit and signals.
        process.on('exit', function() { moneyApp.helperFunctions.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { moneyApp.helperFunctions.terminator(element); });
        });
    };

    //return a single object exposing all of the above functions
    return {
        setupVariables: setupVariables,
        terminator: terminator,
        setupTerminationHandlers: setupTerminationHandlers
    };
}

//expose the helpers function as the default entrypoint for this file.
module.exports = helpers;
