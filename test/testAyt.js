'use strict';

const sinon = require('sinon'),
      chai = require('chai'),
      expect = chai.expect,
      assert = chai.assert,
      ctrl = require('../controllers/aytController'),
      app = require('../common/moneyApi'),
      supertest = require('supertest');

chai.should();

describe('"Are You There??" functional testing', function() {

    var tstCtrl;

    beforeEach(function() {
        tstCtrl = new ctrl({
          'mongourl': '172.17.0.2:27017/money?authSource=admin',
          'environment': 'MOCHA-TESTING',
          'ipaddress': '0.0.0.0',
          'port': '8080'
        });
    });

    it('should load the controller cleanly and create a usable application object', function() {
        expect(tstCtrl).to.not.be.undefined;
        expect(tstCtrl.aytData).to.exist;
    });

    it('should return valid JSON data from the aytData function', function(done) {
        tstCtrl.aytData(function(err, data) {
            //console.log(data);
            expect(err).to.be.null;
            expect(data).to.not.be.null;
            expect(data.application).to.equal('API');
            done();
        })
    })

    it('should return valid json data by running the base app and calling the url /ayt', function(done) {
        process.env.IP = '0.0.0.0';
        process.env.PORT = '8081';
        process.env.MONEYDB_PORT_27017_TCP_ADDR = '172.17.0.2';
        process.env.MONEYDB_PORT_27017_TCP_PORT = '27017';
        process.env.NODE_ENV = 'MOCHA-TESTING';

        var tstApp = new app();
        tstApp.initialize();
        tstApp.start();
        var server = supertest.agent('http://' + process.env.IP + ':' + process.env.PORT);

        server
          .get('/ayt')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
              //console.log(res.body);
              res.status.should.equal(200);
              res.body.application.should.equal("API");
              done();
          })
    })

});
