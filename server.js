#!/bin/env node

var debug        = require('debug')('tonksDEV:money:api:server'),
    MoneyApi     = require('./common/moneyApi'),
    mApp         = new MoneyApi();

mApp.initialize();
mApp.start();
debug('server running');
