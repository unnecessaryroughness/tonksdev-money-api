'use strict';

const sinon = require('sinon'),
      chai = require('chai'),
      expect = chai.expect,
      app = require('../common/moneyApi');

chai.should();

describe('Money API standup', function() {

    it('should start the application cleanly and create a usable application object', function() {
        var tstApp = new app();
        expect(tstApp).to.not.be.undefined;
        expect(tstApp.initialize).to.exist;
        expect(tstApp.start).to.exist;
    });
});
