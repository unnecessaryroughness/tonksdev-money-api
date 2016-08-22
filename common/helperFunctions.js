const debug = require('debug')('tonksDEV:money:api:helpers'),
      debugT = require('debug')('tonksDEV:money:api:term:handlers');

function helpers(moneyApi) {
    'use strict';

    let self = moneyApi;
    moneyApi.variables = {};

    //Set up server IP address and port # using env variables/defaults.
    const setupVariables = function() {
        moneyApi.variables.apiversion = '0.3.1';
        moneyApi.variables.ipaddress = process.env.IP;
        moneyApi.variables.port      = process.env.PORT;
        moneyApi.variables.mongourl  = process.env.MONEYDB_PORT_27017_TCP_ADDR+':'+process.env.MONEYDB_PORT_27017_TCP_PORT + '/money?authSource=admin';
        moneyApi.variables.apikey    = process.env.API_KEY;
        moneyApi.variables.systemacc = process.env.SYSTEMACC;
    };

    // terminator === the termination handler
    // Terminate server on receipt of the specified signal.
    // @param {string} sig  Signal to terminate on.
    const terminator = function(sig){
        if (typeof sig === 'string') {
           debugT('%s: Received %s - terminating tonksDEV Money app ...',
                       Date(Date.now()), sig);

          //close the mongoose connection, if open
           if (typeof moneyApi.mongoose != 'undefined' && moneyApi.mongoose.connection.readyState != 0) {
              debugT('closing connection to mongodb...');
              moneyApi.mongoose.connection.close();
           }
           process.exit(1);
        }
        debugT('%s: Node server stopped.', Date(Date.now()) );
    };

    // Setup termination handlers (for exit and a list of signals).
    const setupTerminationHandlers = function(){

        //  Process on exit and signals.
        process.on('exit', function() { moneyApi.helperFunctions.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { moneyApi.helperFunctions.terminator(element); });
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
