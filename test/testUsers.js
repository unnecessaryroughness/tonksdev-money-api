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

describe('"User" FIND functional testing', function() {

    let tstCtrl, stubFind, stubFindById, stubFindOne, stubSave, stubRemove;

    beforeEach(function() {
        tstCtrl = new ctrl({});
    });

    //TEST APPLICATION
        it('should load the controller cleanly and create a usable application object', function() {
            expect(tstCtrl, 'controller is undefined').to.not.be.undefined;
            expect(tstCtrl.findUser, 'findUser method is undefined').to.exist;
            expect(tstCtrl.findUserByEmail, 'findUserByEmail method is undefined').to.exist;
            expect(tstCtrl.findAllUsers, 'findAllUsers method is undefined').to.exist;
            expect(tstCtrl.constructUserObject, 'constructUserObject method is undefined').to.not.exist;
            expect(tstCtrl.constructUserList, 'constructUserList method is undefined').to.not.exist;
        });

    //SETUP STUBS
        before(function() {
          stubFind = sinon.stub(tonksDEVUser, 'find');
          stubFindById = sinon.stub(tonksDEVUser, 'findById');
          stubFindOne = sinon.stub(tonksDEVUser, 'findOne');
        })

    //FIND-ALL-USERS
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

    //FIND-USER-BY-ID
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

    //FIND-USER-BY-EMAIL
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


    //FIND-ALL-USERS-IN-A-GROUP
        it('should return valid JSON data from the findAllUsersByGroupId function', function(done) {
            stubFind.yields(null, [
                              {'_id': '5770067d85e95a5378fb948e', 'displayName': 'Bobby Carpenter', 'email': 'barbie@dallascowboys.com'},
                              {'_id': '5770067d85e95a5378fb948f', 'displayName': 'Akwasi Owusu-Ansah', 'email': 'kwasi@dallascowboys.com'}
                          ]);
            tstCtrl.findAllUsersByGroupId('TESTUSERS', function(err, data) {
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

        it('should return valid JSON error data from the findAllUsersByGroupId function if no users were found', function(done) {
            stubFind.yields({'userError': {}}, null);
            tstCtrl.findAllUsersByGroupId('DOESNOTEXIST', function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.be.null;
                done();
            })
        })

    //RESET-STUBS
        after(function() {
          tonksDEVUser.findOne.restore();
          tonksDEVUser.findById.restore();
          tonksDEVUser.find.restore();
        });
});

describe('"User" CRUD functional testing', function() {

    //DEFINE-VARIABLES
        let tstCtrl, stubFind, stubFindById, stubFindOne, stubSave, stubRemove, stubUpdate;

        beforeEach(function() {
            tstCtrl = new ctrl({});
        });

    //SETUP STUBS
        before(function() {
          stubSave = sinon.stub(tonksDEVUser.prototype, 'save');
          stubRemove = sinon.stub(tonksDEVUser.prototype, 'remove');
          stubFindById = sinon.stub(tonksDEVUser, 'findById');
          stubUpdate = sinon.stub(tonksDEVUser, 'update');
        })

    //CREATE-USER
        it('should return valid JSON data from the createUser function', function(done) {
            let createBody = {user: {displayName: 'Danny Coale', email: 'whodat@dallascowboys.com'}};
            stubSave.yields(null, {"_id": "5783f4fb44daf4b9671bb304",
                                      "displayName": "Danny Coale",
                                      "email": "whodat@dallascowboys.com",
                                      "image": "",
                                      "payday": "27",
                                      "biography": "",
                                      "joinDate": "2016-01-01",
                                      "groups": [
                                          "ALLUSERS",
                                          "COWBOYS",
                                          "BUSTS"
                                      ]});

            tstCtrl.createUser(createBody, function(err, data) {
                // console.log(data);
                expect(err, 'error was returned').to.be.null;
                expect(data, 'no data was returned').to.not.be.null;
                data.saveStatus.should.equal('created');
                expect(data.user.id, 'no ID for the created user').to.exist;
                expect(data.user.displayName, 'no displayName for the created user').to.exist;
                expect(data.user.email, 'no email for the created user').to.exist;
                data.user.id.should.equal('5783f4fb44daf4b9671bb304')
                data.user.displayName.should.equal('Danny Coale')
                data.user.email.should.equal('whodat@dallascowboys.com')
                done();
            })
        })

        it('should return valid JSON error data from the createUser function if there was a problem saving', function(done) {
            let createBody = {user: {displayName: 'Danny Coale', email: 'whodat@dallascowboys.com'}};
            stubSave.yields({errCode: 1234, errDesc: 'made up error'}, null);
            tstCtrl.createUser(createBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.not.be.null;
                data.saveStatus.should.equal('failed create');
                done();
            })
        })

    //UPDATE-USER
        it('should return valid JSON data from the updateUser function', function(done) {
          let updateBody = {user: {displayName: 'Danny Coale', email: 'whodat@jobcentre.com'}};
          let foundUser = new tonksDEVUser;
          foundUser._id = '5783f4fb44daf4b9671bb304';
          foundUser.displayName = 'Danny Coale';
          foundUser.email = 'whodat@dallascowboys.com';
          foundUser.payday = '27';
          stubFindById.yields(null, foundUser);
          stubSave.yields(null, {"_id": "5783f4fb44daf4b9671bb304",
                                    "displayName": "Danny Coale",
                                    "email": "whodat@jobcentre.com",
                                    "image": "",
                                    "payday": "27",
                                    "biography": "",
                                    "joinDate": "2016-01-01",
                                    "groups": [
                                        "ALLUSERS",
                                        "COWBOYS",
                                        "BUSTS"
                                    ]});

          tstCtrl.updateUser('5783f4fb44daf4b9671bb304', updateBody, function(err, data) {
              // console.log(err, data);
              expect(err, 'error was returned').to.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              data.saveStatus.should.equal('updated');
              expect(data.user.id, 'no ID for the created user').to.exist;
              expect(data.user.displayName, 'no displayName for the created user').to.exist;
              expect(data.user.email, 'no email for the created user').to.exist;
              data.user.id.should.equal('5783f4fb44daf4b9671bb304')
              data.user.displayName.should.equal('Danny Coale')
              data.user.email.should.equal('whodat@jobcentre.com')
              done();
          })
        })
        it('should return valid JSON error data from the updateUser function if the user to update was not found', function(done) {
          let updateBody = {user: {displayName: 'Danny Coale', email: 'whodat@jobcentre.com'}};
          stubFindById.yields(null, null);
          tstCtrl.updateUser('5783f4fb44daf4b9671bb304', updateBody, function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed update');
              done();
            })
        })
        it('should return valid JSON error data from the updateUser function if the user was found but the update failed', function(done) {
          let updateBody = {user: {displayName: 'Danny Coale', email: 'whodat@jobcentre.com'}};
          let foundUser = new tonksDEVUser;
          foundUser._id = '5783f4fb44daf4b9671bb304';
          foundUser.displayName = 'Danny Coale';
          foundUser.email = 'whodat@dallascowboys.com';
          foundUser.payday = '27';
          stubFindById.yields(null, foundUser);
          stubSave.yields({'error': 'Error saving record to the database'}, null);
          tstCtrl.updateUser('5783f4fb44daf4b9671bb304', updateBody, function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed update');
              done();
            })
        })


    //ENSURE-USER-IS-IN-GROUP
        it('should return valid JSON data from the ensureUserIsInGroup function', function(done) {
          stubUpdate.yields(null, {"ok": 1, "nModified": 1, "n": 1});
          tstCtrl.ensureUserIsInGroup('5783f4fb44daf4b9671bb304', 'TESTING', function(err, data) {
              // console.log(err, data);
              expect(err, 'an error was returned').to.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              data.saveStatus.should.not.equal('failed update');
              done();
            })
        })
        it('should return valid JSON error data from the ensureUserIsInGroup function if the user could not be found', function(done) {
          stubUpdate.yields({error: "made up error"}, null);
          tstCtrl.ensureUserIsInGroup('5783f4fb44daf4b9671bb304', 'TESTING', function(err, data) {
              // console.log(err, data);
              expect(err, 'an error was returned').to.not.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed update');
              done();
            })
        })


    //ENSURE-USER-IS-NOT-IN-GROUP
        it('should return valid JSON data from the ensureUserIsNotInGroup function', function(done) {
          stubUpdate.yields(null, {"ok": 1, "nModified": 1, "n": 1});
          tstCtrl.ensureUserIsNotInGroup('5783f4fb44daf4b9671bb304', 'TESTING', function(err, data) {
              // console.log(err, data);
              expect(err, 'an error was returned').to.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              data.saveStatus.should.not.equal('failed update');
              done();
            })
        })
        it('should return valid JSON error data from the ensureUserIsNotInGroup function if the user could not be found', function(done) {
          stubUpdate.yields({error: "made up error"}, null);
          tstCtrl.ensureUserIsNotInGroup('5783f4fb44daf4b9671bb304', 'TESTING', function(err, data) {
              // console.log(err, data);
              expect(err, 'an error was returned').to.not.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed update');
              done();
            })
        })


    //DELETE-USER
        it('should return valid JSON data from the deleteUser function', function(done) {
          let foundUser = new tonksDEVUser;
          foundUser._id = '5783f4fb44daf4b9671bb304';
          foundUser.displayName = 'Danny Coale';
          foundUser.email = 'whodat@dallascowboys.com';
          foundUser.payday = '27';
          stubFindById.yields(null, foundUser);
          stubRemove.yields(null, null);

          tstCtrl.deleteUser('5783f4fb44daf4b9671bb304', function(err, data) {
              // console.log(err, data);
              expect(err, 'error was returned').to.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              data.saveStatus.should.equal('deleted');
              done();
          })
        })
        it('should return valid JSON error data from the deleteUser function if the user to delete was not found', function(done) {
          stubFindById.yields(null, null);
          tstCtrl.deleteUser('5783f4fb44daf4b9671bb304', function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed delete');
              done();
            })
        })
        it('should return valid JSON error data from the deleteUser function if the user was found but the delete operation failed', function(done) {
          let foundUser = new tonksDEVUser;
          foundUser._id = '5783f4fb44daf4b9671bb304';
          foundUser.displayName = 'Danny Coale';
          foundUser.email = 'whodat@dallascowboys.com';
          foundUser.payday = '27';
          stubFindById.yields(null, foundUser);
          stubRemove.yields({'error': 'Error removing record to the database'}, null);
          tstCtrl.deleteUser('5783f4fb44daf4b9671bb304', function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed delete');
              done();
            })
        })

    //RESET-STUBS
        after(function() {
          tonksDEVUser.prototype.save.restore();
          tonksDEVUser.prototype.remove.restore();
          tonksDEVUser.findById.restore();
        });
});



describe('"User" HTTP testing', function() {

    let tstApp, server;

    before(function() {
      process.env.IP = '0.0.0.0';
      process.env.PORT = '8081';
      process.env.MONEYDB_PORT_27017_TCP_ADDR = '172.17.0.2';
      process.env.MONEYDB_PORT_27017_TCP_PORT = '27017';
      process.env.NODE_ENV = 'MOCHA-TESTING';

      tstApp = new app();
      tstApp.initialize();
      tstApp.start();
      server = supertest.agent('http://' + process.env.IP + ':' + process.env.PORT);
    })

    it('should return valid JSON API definition data by running the base app and calling the url /user', function(done) {
        server
          .get('/user/')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err, res) {
              // console.log(res.body);
              res.status.should.equal(200);
              res.body.availableFunctions.should.exist;
              done();
          })
      });

      after(function() {
        tstApp.stop();
      })
});
