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

    let tstCtrl, stubFind, stubFindById, stubFindOne;


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
      stubFind = sinon.stub(tonksDEVUser, 'find');
    })

    it('should return valid JSON data from the findAllUsers function', function(done) {
        stubFind.yields(null, [{'_id': '5770067d85e95a5378fb948e', 'displayName': 'Bobby Carpenter', 'email': 'barbie@dallascowboys.com'}]);
        tstCtrl.findAllUsers(function(err, data) {
            //console.log(data);
            expect(err, 'error was returned').to.be.null;
            expect(data, 'no data was returned').to.not.be.null;
            expect(data.userList.length, 'empty records array was returned').to.be.above(0);
            expect(data.userList[0].id, 'no ID for the first user').to.exist;
            expect(data.userList[0].displayName, 'no displayName for the first user').to.exist;
            expect(data.userList[0].email, 'no email for the first user').to.exist;
            done();
        })
    })

    it('should return valid JSON error data from the findAllUsers function if no user is found', function(done) {
        stubFind.yields({'userError': {}}, null);
        tstCtrl.findAllUsers(function(err, data) {
            //console.log(data);
            expect(err, 'no error was returned').to.not.be.null;
            expect(data, 'some data was returned').to.be.null;
            done();
        })
    })

    after(function() {
      tonksDEVUser.find.restore();
    });


    before(function() {
      stubFindById = sinon.stub(tonksDEVUser, 'findById');
    })

    it('should return valid JSON data from the findUser function', function(done) {
        stubFindById.yields(null, {'_id':'5770067d85e95a5378fb948e', 'displayName': 'Bobby Carpenter', 'email': 'barbie@dallascowboys.com'});
        tstCtrl.findUser('1234567890', function(err, data) {
            //console.log(data);
            expect(err, 'error was returned').to.be.null;
            expect(data, 'no data was returned').to.not.be.null;
            expect(data.user.id, 'no ID for the first user').to.exist;
            expect(data.user.displayName, 'no displayName for the first user').to.exist;
            expect(data.user.email, 'no email for the first user').to.exist;
            done();
        })
    })

    it('should return valid JSON error data from the findUser function if no user was found', function(done) {
        stubFindById.yields({'userError': {}}, null);
        tstCtrl.findUser('1234567890', function(err, data) {
            //console.log(err, data);
            expect(err, 'no error was returned').to.not.be.null;
            expect(data, 'some data was returned').to.be.null;
            done();
        })
    })

    after(function() {
      tonksDEVUser.findById.restore();
    });


    before(function() {
      stubFindOne = sinon.stub(tonksDEVUser, 'findOne');
    })

    it('should return valid JSON data from the findUserByEmail function', function(done) {
        stubFindOne.yields(null, {'_id':'5770067d85e95a5378fb948e', 'displayName': 'Bobby Carpenter', 'email': 'barbie@dallascowboys.com'});
        tstCtrl.findUserByEmail('mark@test', function(err, data) {
            //console.log(data);
            expect(err, 'error was returned').to.be.null;
            expect(data, 'no data was returned').to.not.be.null;
            expect(data.user.id, 'no ID for the first user').to.exist;
            expect(data.user.displayName, 'no displayName for the first user').to.exist;
            expect(data.user.email, 'no email for the first user').to.exist;
            done();
        })
    })

    it('should return valid JSON error data from the findUserByEmail function if no user was found', function(done) {
        stubFindOne.yields({'userError': {}}, null);
        tstCtrl.findUserByEmail('mark@test', function(err, data) {
            //console.log(data);
            expect(err, 'no error was returned').to.not.be.null;
            expect(data, 'some data was returned').to.be.null;
            done();
        })
    })

    after(function() {
      tonksDEVUser.findOne.restore();
    });


    it('should return valid json API definition data by running the base app and calling the url /user/', function(done) {
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
          .get('/user/')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
              //console.log(res.body);
              res.status.should.equal(200);
              res.body.availableFunctions.should.exist;
              tstApp.stop();
              done();
          })
    })

});
