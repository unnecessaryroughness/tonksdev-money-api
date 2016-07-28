'use strict';

const sinon = require('sinon'),
      chai = require('chai'),
      expect = chai.expect,
      assert = chai.assert,
      ctrl = require('../controllers/acctController'),
      app = require('../common/moneyApi'),
      account = require('../models/accountModel'),
      accountGroup = require('../models/accountGroupModel'),
      supertest = require('supertest');

chai.should();

describe('"Account" FIND functional testing', function() {

  let tstCtrl, stubFind, stubFindById, stubFindOne, stubSave, stubRemove;

  beforeEach(function() {
      tstCtrl = new ctrl({});
  });

  //TEST APPLICATION
      it('should load the controller cleanly and create a usable account controller object', function() {
          expect(tstCtrl, 'controller is undefined').to.not.be.undefined;
          // expect(tstCtrl.findUser, 'findUser method is undefined').to.exist;
          // expect(tstCtrl.findUserByEmail, 'findUserByEmail method is undefined').to.exist;
          expect(tstCtrl.findAllAccounts, 'findAllAccounts method is undefined').to.exist;
          // expect(tstCtrl.constructUserObject, 'constructUserObject method is undefined').to.not.exist;
          // expect(tstCtrl.constructUserList, 'constructUserList method is undefined').to.not.exist;
      });

      //SETUP STUBS
          before(function() {
            stubFind = sinon.stub(account, 'find');
            // stubFindById = sinon.stub(tonksDEVUser, 'findById');
            // stubFindOne = sinon.stub(tonksDEVUser, 'findOne');
          })

      //FIND-ALL-USERS
          it('should return valid JSON data from the findAllAccounts function', function(done) {
              stubFind.yields(null, [{"_id" : "579a5a314a4eff2f21d5a109",
                                    	"accountCode" : "XYCURACC",
                                    	"accountName" : "XY Bank Current Account",
                                    	"bankName" : "XY Bank",
                                    	"accountGroup" : "579a57df4a4eff2f21d5a108",
                                    	"balance" : 999.99,
                                    	"createdDate" : "2016-07-28"
                                    }]);
              tstCtrl.findAllAccounts(function(err, data) {
                  // console.log(err, data);
                  expect(err, 'error was returned').to.be.null;
                  expect(data, 'no data was returned').to.not.be.null;
                  expect(data.accountList.length, 'empty records array was returned').to.be.above(0);
                  expect(data.accountList[0].id, 'no ID for the first account').to.exist;
                  expect(data.accountList[0].accountCode, 'no accountCode for the first account').to.exist;
                  expect(data.accountList[0].accountName, 'no accountName for the first account').to.exist;
                  expect(data.accountList[0].bankName, 'no bankName for the first account').to.exist;
                  expect(data.accountList[0].accountGroup, 'no accountGroup for the first account').to.exist;
                  expect(data.accountList[0].balance, 'no balance for the first account').to.exist;
                  expect(data.accountList[0].createdDate, 'no createdDate for the first account').to.exist;
                  expect(data.accountList[0].links, 'no links for the first account').to.exist;
                  done();
              })
          })

          it('should return valid JSON error data from the findAllUsers function if no user is found', function(done) {
              stubFind.yields({error: 101, errorMessage: "miscellaneous error"}, null);
              tstCtrl.findAllAccounts(function(err, data) {
                  console.log(err, data);
                  expect(err, 'no error was returned').to.not.be.null;
                  expect(data, 'some data was returned').to.be.null;
                  done();
              })
          })

      //RESET-STUBS
          after(function() {
            // tonksDEVUser.findOne.restore();
            // tonksDEVUser.findById.restore();
            account.find.restore();
          });

})
