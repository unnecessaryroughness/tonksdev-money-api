'use strict';

const sinon = require('sinon'),
      chai = require('chai'),
      expect = chai.expect,
      assert = chai.assert,
      ctrl = require('../controllers/userController'),
      app = require('../common/moneyApi'),
      tonksDEVUser = require('../models/tonksdevUserModel.js'),
      supertest = require('supertest');

chai.should();

describe('"User" functional testing', function() {

    let tstCtrl;


    beforeEach(function() {
        tstCtrl = new ctrl({});
    });


    it('should load the controller cleanly and create a usable application object', function() {
        expect(tstCtrl, 'controller is undefined').to.not.be.undefined;
        expect(tstCtrl.findUser, 'findUser method is undefined').to.exist;
        expect(tstCtrl.findUserByEmail, 'findUserByEmail method is undefined').to.exist;
        expect(tstCtrl.findAllUsers, 'findAllUsers method is undefined').to.exist;
        expect(tstCtrl.constructUserObject, 'constructUserObject method is undefined').to.not.exist;
        expect(tstCtrl.constructUserList, 'constructUserList method is undefined').to.not.exist;
    });

    before(function() {
      //stub out the tonksDEVUser.find method
      let stubFind = sinon.stub(tonksDEVUser, 'find');
      stubFind.yields(null, [{'_id': '5770067d85e95a5378fb948e', 'displayName': 'Bobby Carpenter', 'email': 'barbie@dallascowboys.com'}])
    })

    it('should return valid JSON data from the findAllUsers function', function(done) {
        tstCtrl.findAllUsers(function(err, data) {
            //console.log(data);
            expect(err, 'error was returned').to.be.null;
            expect(data, 'no data was returned').to.not.be.null;
            expect(data.length, 'empty records array was returned').to.be.above(0);
            expect(data[0].id, 'no ID for the first user').to.exist;
            expect(data[0].displayName, 'no displayName for the first user').to.exist;
            expect(data[0].email, 'no email for the first user').to.exist;
            done();
        })
    })

    after(function() {
      tonksDEVUser.find.restore();
    });

    before(function() {
      //stub out the tonksDEVUser.findById method
      let stubFindById = sinon.stub(tonksDEVUser, 'findById');
      stubFindById.yields(null, {'id':'5770067d85e95a5378fb948e', 'displayName': 'Bobby Carpenter', 'email': 'barbie@dallascowboys.com'})
    })

    it('should return valid JSON data from the findUser function', function(done) {
        tstCtrl.findUser(function(err, data) {
            //console.log(data);
            expect(err, 'error was returned').to.be.null;
            expect(data, 'no data was returned').to.not.be.null;
            expect(data.id, 'no ID for the first user').to.exist;
            expect(data.displayName, 'no displayName for the first user').to.exist;
            expect(data.email, 'no email for the first user').to.exist;
            done();
        })
    })

    after(function() {
      tonksDEVUser.findById.restore();
    });
    // it('should return valid json data by running the base app and calling the url /ayt', function(done) {
    //     process.env.IP = '0.0.0.0';
    //     process.env.PORT = '8081';
    //     process.env.MONEYDB_PORT_27017_TCP_ADDR = '172.17.0.2';
    //     process.env.MONEYDB_PORT_27017_TCP_PORT = '27017';
    //     process.env.NODE_ENV = 'MOCHA-TESTING';
    //
    //     var tstApp = new app();
    //     tstApp.initialize();
    //     tstApp.start();
    //     var server = supertest.agent('http://' + process.env.IP + ':' + process.env.PORT);
    //
    //     server
    //       .get('/ayt')
    //       .expect('Content-Type', /json/)
    //       .expect(200)
    //       .end(function(err, res) {
    //           //console.log(res.body);
    //           res.status.should.equal(200);
    //           res.body.application.should.equal("API");
    //           done();
    //       })
    // })

});
