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

  let tstCtrl, stubFind, stubFindById, stubFindOne, stubSave, stubRemove, stubGrpFind, stubGrpFindById;

  beforeEach(function() {
      tstCtrl = new ctrl({});
  });

  //TEST APPLICATION
      it('should load the controller cleanly and create a usable account controller object', function() {
          expect(tstCtrl, 'controller is undefined').to.not.be.undefined;
          expect(tstCtrl.findAccount, 'findAccount method is undefined').to.exist;
          expect(tstCtrl.findAllAccounts, 'findAllAccounts method is undefined').to.exist;
          expect(tstCtrl.findAllAccountGroups, 'findAllAccountGroups method is undefined').to.exist;
          expect(tstCtrl.findAccountGroup, 'findAccountGroup method is undefined').to.exist;
      });

      //SETUP STUBS
          before(function() {
            stubFind = sinon.stub(account, 'find');
            stubFindById = sinon.stub(account, 'findById');
            stubGrpFind = sinon.stub(accountGroup, 'find');
            stubGrpFindById = sinon.stub(accountGroup, 'findById');
          });

          beforeEach(function() {
            stubFind.yields(null, [{"_id" : "579a5a314a4eff2f21d5a109",
                                    "accountCode" : "XYCURACC",
                                    "accountName" : "XY Bank Current Account",
                                    "bankName" : "XY Bank",
                                    "accountGroup" : "579a57df4a4eff2f21d5a108",
                                    "balance" : 999.99,
                                    "createdDate" : "2016-07-28"
                                  }]);
            stubGrpFind.yields(null, [{
                                    "members": [ "5770067d85e95a5378fb948e", "5783f4fb44daf4b9671bb304" ],
                                    "accounts": [],
                                    "createdDate": "2016-07-28",
                                    "groupCode": 'TEST',
                                    "password": 'testing',
                                    "owner": "5770067d85e95a5378fb948e",
                                    "description": 'Testing account group',
                                    "_id": "579a57df4a4eff2f21d5a108"
                                  }]);

            stubFindById.yields(null, {"_id" : "579a5a314a4eff2f21d5a109",
                                    "accountCode" : "XYCURACC",
                                    "accountName" : "XY Bank Current Account",
                                    "bankName" : "XY Bank",
                                    "accountGroup" : "579a57df4a4eff2f21d5a108",
                                    "balance" : 999.99,
                                    "createdDate" : "2016-07-28"
                                  });
            stubGrpFindById.yields(null, {
                                    "members": [ "5770067d85e95a5378fb948e", "5783f4fb44daf4b9671bb304" ],
                                    "accounts": [],
                                    "createdDate": "2016-07-28",
                                    "groupCode": 'TEST',
                                    "password": 'testing',
                                    "owner": "5770067d85e95a5378fb948e",
                                    "description": 'Testing account group',
                                    "_id": "579a57df4a4eff2f21d5a108"
                                  });
          });

      //FIND-ALL-ACCOUNTS
          it('should return valid JSON data from the findAllAccounts function', function(done) {
              tstCtrl.findAllAccounts('123456789', function(err, data) {
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

          it('should return valid JSON error data from the findAllAccounts function if no user is found', function(done) {
              stubFind.yields({error: 101, errorMessage: "miscellaneous error"}, null);
              tstCtrl.findAllAccounts('123456789', function(err, data) {
                  // console.log(err, data);
                  expect(err, 'no error was returned').to.not.be.null;
                  expect(data, 'some data was returned').to.be.null;
                  done();
              })
          })


      //FIND-ACCOUNT-BY-ID
          it('should return valid JSON data from the findAccount function', function(done) {
              tstCtrl.findAccount('5770067d85e95a5378fb948e', '1234567890', function(err, data) {
                  // console.log(err, data);
                  expect(err, 'error was returned').to.be.null;
                  expect(data, 'no data was returned').to.not.be.null;
                  expect(data.account.id, 'no ID for the first user').to.exist;
                  expect(data.account.accountCode, 'no displayName for the user').to.exist;
                  expect(data.account.accountName, 'no email for the user').to.exist;
                  expect(data.account.bankName, 'no bankName for the account').to.exist;
                  expect(data.account.accountGroup, 'no accountGroup for the account').to.exist;
                  expect(data.account.balance, 'no balance for the account').to.exist;
                  expect(data.account.createdDate, 'no createdDate for the account').to.exist;
                  expect(data.account.links, 'no links for the account').to.exist;
                  done();
            });
          });
          it('should return valid JSON error data from the findAccount function if no user was found', function(done) {
            stubFindById.yields({error: 101, errorMessage: "miscellaneous error"}, null);
            tstCtrl.findAccount('1234567890', function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.be.null;
                done();
            });
          });
          it('should return valid JSON error data from the findAccount function access was denied', function(done) {
            tstCtrl.findAccount('xxxxxxxxxxxxxxxxx', '1234567890', function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.be.null;
                done();
            });
          });

    //FIND-ALL-ACCOUNT-GROUPS
        it('should return valid JSON data from the findAllAccountGroups function', function(done) {
            tstCtrl.findAllAccountGroups('123456789', function(err, data) {
                // console.log(err, data);
                expect(err, 'error was returned').to.be.null;
                expect(data, 'no data was returned').to.not.be.null;
                expect(data.accountGroupList.length, 'empty records array was returned').to.be.above(0);
                expect(data.accountGroupList[0].id, 'no ID for the first account').to.exist;
                expect(data.accountGroupList[0].groupCode, 'no groupCode for the first account').to.exist;
                expect(data.accountGroupList[0].description, 'no description for the first account').to.exist;
                expect(data.accountGroupList[0].owner, 'no owner for the first account').to.exist;
                expect(data.accountGroupList[0].members, 'no members for the first account').to.exist;
                expect(data.accountGroupList[0].password, 'no password for the first account').to.exist;
                expect(data.accountGroupList[0].createdDate, 'no createdDate for the first account').to.exist;
                expect(data.accountGroupList[0].links, 'no links for the first account').to.exist;
                done();
            })
        })

        it('should return valid JSON error data from the findAllAccounts function if no user is found', function(done) {
            stubGrpFind.yields({error: 101, errorMessage: "miscellaneous error"}, null);
            tstCtrl.findAllAccounts('1234567890', function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.be.null;
                done();
            })
        })


        //FIND-ACCOUNT-GROUP-BY-ID
            it('should return valid JSON data from the findAccountGroup function', function(done) {
                tstCtrl.findAccountGroup('5770067d85e95a5378fb948e', '1234567890', function(err, data) {
                    // console.log(err, data);
                    expect(err, 'error was returned').to.be.null;
                    expect(data, 'no data was returned').to.not.be.null;
                    expect(data.accountGroup.id, 'no ID for the first user').to.exist;
                    expect(data.accountGroup.groupCode, 'no groupCode for the first account').to.exist;
                    expect(data.accountGroup.description, 'no description for the first account').to.exist;
                    expect(data.accountGroup.owner, 'no owner for the first account').to.exist;
                    expect(data.accountGroup.members, 'no members for the first account').to.exist;
                    expect(data.accountGroup.password, 'no password for the first account').to.exist;
                    expect(data.accountGroup.createdDate, 'no createdDate for the first account').to.exist;
                    expect(data.accountGroup.links, 'no links for the first account').to.exist;
                    done();
                  });
            });
            it('should return valid JSON error data from the findAccountGroup function if no account group was found', function(done) {
              stubGrpFindById.yields({error: 101, errorMessage: "miscellaneous error"}, null);
              tstCtrl.findAccountGroup('5770067d85e95a5378fb948e', '1234567890', function(err, data) {
                  // console.log(err, data);
                  expect(err, 'no error was returned').to.not.be.null;
                  expect(data, 'some data was returned').to.be.null;
                  done();
              });
            });
            it('should return valid JSON error data from the findAccountGroup function if access was denied', function(done) {
              tstCtrl.findAccountGroup('xxxxxxxxxxxxxxxxxxxxx', '1234567890', function(err, data) {
                  // console.log(err, data);
                  expect(err, 'no error was returned').to.not.be.null;
                  expect(data, 'some data was returned').to.be.null;
                  done();
              });
            });


        //FIND-ALL-ACCOUNTS-IN-ACCOUNT-GROUP
            it('should return valid JSON data from the findAllAccountsInGroup function', function(done) {
                tstCtrl.findAllAccountsInGroup('5770067d85e95a5378fb948e', '0987654321', function(err, data) {
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
            });
            it('should return valid JSON error data from the findAllAccountsInGroup function if no account group was found', function(done) {
              stubGrpFindById.yields({error: 101, errorMessage: "miscellaneous error"}, null);
              tstCtrl.findAllAccountsInGroup('5770067d85e95a5378fb948e', '1234567890', function(err, data) {
                  // console.log(err, data);
                  expect(err, 'no error was returned').to.not.be.null;
                  expect(data, 'some data was returned').to.be.null;
                  done();
              });
            });
            it('should return valid JSON error data from the findAllAccountsInGroup function if no account is found', function(done) {
              stubFind.yields({error: 101, errorMessage: "miscellaneous error"}, null);
              tstCtrl.findAllAccountsInGroup('5770067d85e95a5378fb948e', '123456789', function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.be.null;
                done();
              })
            })


      //RESET-STUBS
          after(function() {
            accountGroup.findById.restore();
            accountGroup.find.restore();
            account.findById.restore();
            account.find.restore();
          });

})


describe('"Account" CRUD functional testing', function() {

    //DEFINE-VARIABLES
        let tstCtrl, stubFind, stubFindById, stubGrpFind, stubGrpFindById, stubSave, stubGrpSave, stubRemove, stubGrpRemove;

        beforeEach(function() {
            tstCtrl = new ctrl({});
        });

    //SETUP STUBS
    before(function() {
      stubFind        = sinon.stub(account,       'find');
      stubFindById    = sinon.stub(account,       'findById');
      stubGrpFind     = sinon.stub(accountGroup,  'find');
      stubGrpFindById = sinon.stub(accountGroup,  'findById');
      stubSave        = sinon.stub(account.prototype, 'save');
      stubGrpSave     = sinon.stub(accountGroup.prototype, 'save');
      stubGrpRemove   = sinon.stub(accountGroup.prototype, 'remove');
    });

    beforeEach(function() {
      stubFind.yields(null, [{"_id" : "579a5a314a4eff2f21d5a109",
                              "accountCode" : "XYCURACC",
                              "accountName" : "XY Bank Current Account",
                              "bankName" : "XY Bank",
                              "accountGroup" : "579a57df4a4eff2f21d5a108",
                              "balance" : 999.99,
                              "createdDate" : "2016-07-28"
                            }]);
      stubGrpFind.yields(null, [{
                              "members": [ "5770067d85e95a5378fb948e", "5783f4fb44daf4b9671bb304" ],
                              "accounts": [],
                              "createdDate": "2016-07-28",
                              "groupCode": 'TEST',
                              "password": 'testing',
                              "owner": "5770067d85e95a5378fb948e",
                              "description": 'Testing account group',
                              "_id": "579a57df4a4eff2f21d5a108"
                            }]);

      stubFindById.yields(null, {"_id" : "579a5a314a4eff2f21d5a109",
                              "accountCode" : "XYCURACC",
                              "accountName" : "XY Bank Current Account",
                              "bankName" : "XY Bank",
                              "accountGroup" : "579a57df4a4eff2f21d5a108",
                              "balance" : 999.99,
                              "createdDate" : "2016-07-28"
                            });
      stubGrpFindById.yields(null, {
                              "members": [ "5770067d85e95a5378fb948e", "5783f4fb44daf4b9671bb304" ],
                              "accounts": [],
                              "createdDate": "2016-07-28",
                              "groupCode": 'TEST',
                              "password": 'testing',
                              "owner": "5770067d85e95a5378fb948e",
                              "description": 'Testing account group',
                              "_id": "579a57df4a4eff2f21d5a108"
                            });
      stubSave.yields(null, {
        "_id" : "579a5a314a4eff2f21d5a109",
        "accountCode" : "XYCURACC",
        "accountName" : "XY Bank Current Account",
        "bankName" : "XY Bank",
        "accountGroup" : "579a57df4a4eff2f21d5a108",
        "balance" : 999.99,
        "createdDate" : "2016-07-28"
      });

      stubGrpSave.yields(null, {
        "_id": "57a24d3d962832317a82e15a",
        "groupCode": "TEST",
        "description": "Test account group",
        "owner": "5770067d85e95a5378fb948e",
        "members": [
          "5770067d85e95a5378fb948e"
        ],
        "password": "test",
        "createdDate": "2016-07-03T00:00:00.000Z"
      });

      stubGrpRemove.yields(null, {
          "removed": 1
      })
    });

    //CREATE-ACCOUNT
        it('should return valid JSON data from the createAccount function', function(done) {
            let createBody = {"account": {"accountCode": "RAINYDAY", "accountName": "Rainy Day Savings Account", "bankName": "Halifax",
                              "accountGroup": "579a57df4a4eff2f21d5a108", "balance": 4567.89, "createdDate": "2016-08-02"} };

            tstCtrl.createAccount(createBody, function(err, data) {
                // console.log(data);
                expect(err, 'error was returned').to.be.null;
                expect(data, 'no data was returned').to.not.be.null;
                data.saveStatus.should.equal('created');
                expect(data.account.id, 'no ID for the created account').to.exist;
                expect(data.account.accountCode, 'no accountCode for the created account').to.exist;
                expect(data.account.accountGroup, 'no accountGroup for the created account').to.exist;
                expect(data.account.balance, 'no balance for the created account').to.exist;
                expect(data.account.createdDate, 'no createdDate for the created account').to.exist;
                data.account.id.should.equal('579a5a314a4eff2f21d5a109')
                data.account.accountCode.should.equal('XYCURACC')
                done();
            })
        })

        it('should return valid JSON error data from the createAccont function if there was a problem saving', function(done) {
          let createBody = {"account": {"accountCode": "RAINYDAY", "accountName": "Rainy Day Savings Account", "bankName": "Halifax",
                            "accountGroup": "579a57df4a4eff2f21d5a108", "balance": 4567.89, "createdDate": "2016-08-02"} };

            stubSave.yields({errCode: 1234, errDesc: 'made up error'}, null);
            tstCtrl.createAccount(createBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.not.be.null;
                data.saveStatus.should.equal('failed create');
                done();
            })
        })


    //UPDATE-ACCOUNT
        it('should return valid JSON data from the updateAccount function', function(done) {
            let updateBody = {"account": {"accountCode": "RAINYDAYXXX", "accountName": "Rainy Day Savings AccountXXXX", "bankName": "HalifaxXXX",
                              "accountGroup": "579a57df4a4eff2f21d5a108", "balance": 111.89} };

            let foundAcct = new account;
            foundAcct.accountCode = "RAINYDAY";
            foundAcct.accountName = "Rainy Day Savings Account";
            foundAcct.bankName = "Halifax";
            foundAcct.accountGroup = "579a57df4a4eff2f21d5a108";
            foundAcct.balance = 1234.56;
            foundAcct.createdDate = "2016-08-03";
            stubFindById.yields(null, foundAcct);

            stubSave.yields(null, {
              "_id" : "579a5a314a4eff2f21d5a109",
              "accountCode" : "RAINYDAYXXX",
              "accountName" : "Rainy Day Savings AccountXXXX",
              "bankName" : "HalifaxXXX",
              "accountGroup" : "579a57df4a4eff2f21d5a108",
              "balance" : 111.89,
              "createdDate" : "2016-08-03"
            });

            tstCtrl.updateAccount('5770067d85e95a5378fb948e', '579a5a314a4eff2f21d5a109', updateBody, function(err, data) {
                //console.log(data);
                expect(err, 'error was returned').to.be.null;
                expect(data, 'no data was returned').to.not.be.null;
                data.saveStatus.should.equal('updated');
                expect(data.account.id, 'no ID for the updated account').to.exist;
                expect(data.account.accountCode, 'no accountCode for the updated account').to.exist;
                expect(data.account.accountGroup, 'no accountGroup for the updated account').to.exist;
                expect(data.account.balance, 'no balance for the updated account').to.exist;
                expect(data.account.createdDate, 'no createdDate for the updated account').to.exist;
                data.account.id.should.equal('579a5a314a4eff2f21d5a109');
                data.account.accountCode.should.equal('RAINYDAYXXX');
                data.account.accountName.should.equal('Rainy Day Savings AccountXXXX');
                data.account.bankName.should.equal('HalifaxXXX');
                data.account.balance.should.equal(111.89);
                done();
            })
        })
        it('should return valid JSON error data from the updateAccount function if there was a problem finding the record to save', function(done) {
          let updateBody = {"account": {"accountCode": "RAINYDAYXXX", "accountName": "Rainy Day Savings AccountXXXX", "bankName": "HalifaxXXX",
                            "accountGroup": "579a57df4a4eff2f21d5a108", "balance": 111.89} };

            let foundAcct = null;
            stubFindById.yields(null, foundAcct);

            stubSave.yields({errCode: 1234, errDesc: 'made up error'}, null);
            tstCtrl.updateAccount('5770067d85e95a5378fb948e', '579a5a314a4eff2f21d5a109', updateBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.not.be.null;
                data.saveStatus.should.equal('failed update');
                done();
            })
        })
        it('should return valid JSON error data from the updateAccount function if there was a problem saving', function(done) {
          let updateBody = {"account": {"accountCode": "RAINYDAYXXX", "accountName": "Rainy Day Savings AccountXXXX", "bankName": "HalifaxXXX",
                            "accountGroup": "579a57df4a4eff2f21d5a108", "balance": 111.89} };

            let foundAcct = new account;
            foundAcct.accountCode = "RAINYDAY";
            foundAcct.accountName = "Rainy Day Savings Account";
            foundAcct.bankName = "Halifax";
            foundAcct.accountGroup = "579a57df4a4eff2f21d5a108";
            foundAcct.balance = 1234.56;
            foundAcct.createdDate = "2016-08-03";
            stubFindById.yields(null, foundAcct);

            stubSave.yields({errCode: 1234, errDesc: 'made up error'}, null);
            tstCtrl.updateAccount('5770067d85e95a5378fb948e', '579a5a314a4eff2f21d5a109', updateBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.not.be.null;
                data.saveStatus.should.equal('failed update');
                done();
            })
        })
        it('should return valid JSON error data from the updateAccount function if the user didnt have permission to save', function(done) {
          let updateBody = {"account": {"accountCode": "RAINYDAYXXX", "accountName": "Rainy Day Savings AccountXXXX", "bankName": "HalifaxXXX",
                            "accountGroup": "579a57df4a4eff2f21d5a108", "balance": 111.89} };

            let foundAcct = new account;
            foundAcct.accountCode = "RAINYDAY";
            foundAcct.accountName = "Rainy Day Savings Account";
            foundAcct.bankName = "Halifax";
            foundAcct.accountGroup = "579a57df4a4eff2f21d5a108";
            foundAcct.balance = 1234.56;
            foundAcct.createdDate = "2016-08-03";
            stubFindById.yields(null, foundAcct);

            stubSave.yields(null, {
              "_id" : "579a5a314a4eff2f21d5a109",
              "accountCode" : "RAINYDAYXXX",
              "accountName" : "Rainy Day Savings AccountXXXX",
              "bankName" : "HalifaxXXX",
              "accountGroup" : "579a57df4a4eff2f21d5a108",
              "balance" : 111.89,
              "createdDate" : "2016-08-03"
            });

            tstCtrl.updateAccount('xxxxxxxxxxxxxxxxx', '579a5a314a4eff2f21d5a109', updateBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.be.null;
                done();
            })
        })








    //CREATE-ACCOUNT-GROUP
        it('should return valid JSON data from the createAccountGroup function', function(done) {
            let createBody = {"accountGroup": {"groupCode": "TEST", "description": "Test account group", "owner": "5770067d85e95a5378fb948e",
                                "members": ["5770067d85e95a5378fb948e"], "password": "test"}}

            tstCtrl.createAccountGroup(createBody, function(err, data) {
                //console.log(err, data);
                expect(err, 'error was returned').to.be.null;
                expect(data, 'no data was returned').to.not.be.null;
                data.saveStatus.should.equal('created');
                expect(data.accountGroup.id, 'no ID for the created account').to.exist;
                expect(data.accountGroup.groupCode, 'no groupCode for the created account').to.exist;
                expect(data.accountGroup.description, 'no description for the created account').to.exist;
                expect(data.accountGroup.owner, 'no owner for the created account').to.exist;
                expect(data.accountGroup.members, 'no members for the created account').to.exist;
                expect(data.accountGroup.password, 'no password for the created account').to.exist;
                expect(data.accountGroup.createdDate, 'no createdDate for the created account').to.exist;
                data.accountGroup.id.should.equal('57a24d3d962832317a82e15a')
                data.accountGroup.groupCode.should.equal('TEST')
                done();
            })
        })

        it('should return valid JSON error data from the createAccountGroup function if there was a problem saving', function(done) {
          let createBody = {"accountGroup": {"groupCode": "TEST", "description": "Test account group", "owner": "5770067d85e95a5378fb948e",
                              "members": ["5770067d85e95a5378fb948e"], "password": "test"}}

            stubGrpSave.yields({errCode: 1234, errDesc: 'made up error'}, null);
            tstCtrl.createAccountGroup(createBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.not.be.null;
                data.saveStatus.should.equal('failed create');
                done();
            })
        })


    //UPDATE-ACCOUNT-GROUP
        it('should return valid JSON data from the updateAccountGroup function', function(done) {
            let updateBody = {"accountGroup": {"groupCode": "TESTING", "description": "Test account group update", "owner": "5770067d85e95a5378fb948e",
                              "members": ["5770067d85e95a5378fb948e"], "password": "test1234"}}

            let foundGroup = new accountGroup;
            foundGroup._id = "57a24d3d962832317a82e15a";
            foundGroup.groupCode = "TEST";
            foundGroup.description = "Test account group";
            foundGroup.owner = "5770067d85e95a5378fb948e";
            foundGroup.members = ["579a57df4a4eff2f21d5a108", "5770067d85e95a5378fb948e"];
            foundGroup.password = "testxyz";
            foundGroup.createdDate = "2016-08-03";
            stubGrpFindById.yields(null, foundGroup);

            stubGrpSave.yields(null, {
              "_id": "57a24d3d962832317a82e15a",
              "groupCode": "TESTING",
              "description": "Test account group update",
              "owner": "5770067d85e95a5378fb948e",
              "members": [
                "5770067d85e95a5378fb948e"
              ],
              "password": "test1234",
              "createdDate": "2016-08-03T00:00:00.000Z"
            });

            tstCtrl.updateAccountGroup('5770067d85e95a5378fb948e', '57a24d3d962832317a82e15a', updateBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'error was returned').to.be.null;
                expect(data, 'no data was returned').to.not.be.null;
                data.saveStatus.should.equal('updated');
                expect(data.accountGroup.id, 'no ID for the updated account').to.exist;
                expect(data.accountGroup.groupCode, 'no groupCode for the updated accountgroup').to.exist;
                expect(data.accountGroup.description, 'no description for the updated accountgroup').to.exist;
                expect(data.accountGroup.members, 'no members for the updated accountgroup').to.exist;
                expect(data.accountGroup.password, 'no password for the updated accountgroup').to.exist;
                data.accountGroup.id.should.equal('57a24d3d962832317a82e15a');
                data.accountGroup.groupCode.should.equal('TESTING');
                data.accountGroup.description.should.equal('Test account group update');
                data.accountGroup.password.should.equal('test1234');
                done();
            })
        })
        it('should return valid JSON error data from the updateAccountGroup function if there was a problem finding the record to save', function(done) {
          let updateBody = {"accountGroup": {"groupCode": "TESTING", "description": "Test account group update", "owner": "5770067d85e95a5378fb948e",
                            "members": ["5770067d85e95a5378fb948e"], "password": "test1234"}}

            let foundGroup = null;
            stubGrpFindById.yields(null, foundGroup);

            stubGrpSave.yields({errCode: 1234, errDesc: 'made up error'}, null);
            tstCtrl.updateAccountGroup('5770067d85e95a5378fb948e', '57a24d3d962832317a82e15a', updateBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.not.be.null;
                data.saveStatus.should.equal('failed update');
                done();
            })
        })
        it('should return valid JSON error data from the updateAccountGroup function if there was a problem saving', function(done) {
          let updateBody = {"accountGroup": {"groupCode": "TESTING", "description": "Test account group update", "owner": "5770067d85e95a5378fb948e",
                            "members": ["5770067d85e95a5378fb948e"], "password": "test1234"}}

            let foundGroup = new accountGroup;
            foundGroup._id = "57a24d3d962832317a82e15a";
            foundGroup.groupCode = "TEST";
            foundGroup.description = "Test account group";
            foundGroup.owner = "5770067d85e95a5378fb948e";
            foundGroup.members = ["579a57df4a4eff2f21d5a108", "5770067d85e95a5378fb948e"];
            foundGroup.password = "testxyz";
            foundGroup.createdDate = "2016-08-03";
            stubGrpFindById.yields(null, foundGroup);

            stubGrpSave.yields({errCode: 1234, errDesc: 'made up error'}, null);
            tstCtrl.updateAccountGroup('5770067d85e95a5378fb948e', '57a24d3d962832317a82e15a', updateBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.not.be.null;
                data.saveStatus.should.equal('failed update');
                done();
            })
        })
        it('should return valid JSON error data from the updateAccountGroup function if the user didnt have permission to save', function(done) {
          let updateBody = {"accountGroup": {"groupCode": "TESTING", "description": "Test account group update", "owner": "5770067d85e95a5378fb948e",
                            "members": ["5770067d85e95a5378fb948e"], "password": "test1234"}}

            let foundGroup = new accountGroup;
            foundGroup._id = "57a24d3d962832317a82e15a";
            foundGroup.groupCode = "TEST";
            foundGroup.description = "Test account group";
            foundGroup.owner = "5770067d85e95a5378fb948e";
            foundGroup.members = ["579a57df4a4eff2f21d5a108", "5770067d85e95a5378fb948e"];
            foundGroup.password = "testxyz";
            foundGroup.createdDate = "2016-08-03";
            stubGrpFindById.yields(null, foundGroup);

            stubGrpSave.yields(null, {
              "_id": "57a24d3d962832317a82e15a",
              "groupCode": "TESTING",
              "description": "Test account group update",
              "owner": "5770067d85e95a5378fb948e",
              "members": [
                "5770067d85e95a5378fb948e"
              ],
              "password": "test1234",
              "createdDate": "2016-08-03T00:00:00.000Z"
            });

            tstCtrl.updateAccountGroup('xxxxxxxxxxxxxxxxx', '57a24d3d962832317a82e15a', updateBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.be.null;
                done();
            })
        })


    //REMOVE-ACCOUNT-GROUP
    it('should return a valid JSON response status (deleted) from the deleteAccountGroup function', function(done) {

        let foundGroup = new accountGroup;
        foundGroup._id = "579a57df4a4eff2f21d5a109";
        foundGroup.groupCode = "TEST";
        foundGroup.description = "Test account group";
        foundGroup.owner = "5770067d85e95a5378fb948e";
        foundGroup.members = ["579a57df4a4eff2f21d5a108", "5770067d85e95a5378fb948e"];
        foundGroup.password = "testing";
        foundGroup.createdDate = "2016-08-03";
        stubGrpFindById.yields(null, foundGroup);

        stubFind.yields(null, null);

        tstCtrl.deleteAccountGroup('5770067d85e95a5378fb948e', '579a57df4a4eff2f21d5a109', 'testing', function(err, data) {
            // console.log(err, data);
            expect(err, 'no error was returned').to.be.null;
            expect(data, 'some data was returned').to.not.be.null;
            data.saveStatus.should.equal('deleted');
            done();
        })
    })
    it('should return a valid JSON response status from the deleteAccountGroup function if the group cannot be deleted because it is not empty', function(done) {
        tstCtrl.deleteAccountGroup('5770067d85e95a5378fb948e', '579a57df4a4eff2f21d5a108', 'testing', function(err, data) {
            // console.log(err, data);
            expect(err, 'no error was returned').to.not.be.null;
            expect(data, 'some data was returned').to.not.be.null;
            data.saveStatus.should.equal('failed remove; group not empty');
            done();
        })
    })
    it('should return a valid JSON response status from the deleteAccountGroup function if the group cannot be deleted because the password is incorrect', function(done) {
        tstCtrl.deleteAccountGroup('5770067d85e95a5378fb948e', '579a57df4a4eff2f21d5a108', 'xxxxxxxxx', function(err, data) {
            // console.log(err, data);
            expect(err, 'no error was returned').to.not.be.null;
            expect(data, 'some data was returned').to.not.be.null;
            data.saveStatus.should.equal('failed remove; incorrect password');
            done();
        })
    })
    it('should return a valid JSON response status from the deleteAccountGroup function if the group cannot be deleted because the group doesnt exist', function(done) {
        stubGrpFindById.yields(null, null);
        tstCtrl.deleteAccountGroup('5770067d85e95a5378fb948e', '579a57df4a4eff2f21d5a107', 'testing', function(err, data) {
            // console.log(err, data);
            expect(err, 'no error was returned').to.not.be.null;
            expect(data, 'some data was returned').to.not.be.null;
            data.saveStatus.should.equal('failed remove');
            done();
        })
    })
    it('should return a valid JSON response status from the deleteAccountGroup function if the group cannot be deleted because the remove operation failed', function(done) {
        let foundGroup = new accountGroup;
        foundGroup._id = "579a57df4a4eff2f21d5a109";
        foundGroup.groupCode = "TEST";
        foundGroup.description = "Test account group";
        foundGroup.owner = "5770067d85e95a5378fb948e";
        foundGroup.members = ["579a57df4a4eff2f21d5a108", "5770067d85e95a5378fb948e"];
        foundGroup.password = "testing";
        foundGroup.createdDate = "2016-08-03";
        stubGrpFindById.yields(null, foundGroup);

        stubFind.yields(null, null);

        stubGrpRemove.yields({errCode: 1234, errDesc: 'made up error'}, null);

        tstCtrl.deleteAccountGroup('5770067d85e95a5378fb948e', '579a57df4a4eff2f21d5a107', 'testing', function(err, data) {
            // console.log(err, data);
            expect(err, 'no error was returned').to.not.be.null;
            expect(data, 'some data was returned').to.not.be.null;
            data.saveStatus.should.equal('failed remove');
            done();
        })
    })


    //RESET-STUBS
        after(function() {
          accountGroup.findById.restore();
          accountGroup.find.restore();
          account.findById.restore();
          account.find.restore();
          account.prototype.save.restore();
        });
});
