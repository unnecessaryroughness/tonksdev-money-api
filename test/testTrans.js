'use strict';

const sinon = require('sinon'),
      chai = require('chai'),
      expect = chai.expect,
      assert = chai.assert,
      ctrl = require('../controllers/transController'),
      transaction = require('../models/transactionModel.js'),
      supertest = require('supertest');

chai.should();

describe('"Transaction" functional testing', function() {

  let tstCtrl, stubFind, stubFindById, stubFindOne, stubSave, stubRemove, stubUpdate, mockFind;

  beforeEach(function() {
      tstCtrl = new ctrl({});
  });

  //TEST APPLICATION
      it('should load the controller cleanly and create a usable application object', function() {
          expect(tstCtrl, 'controller is undefined').to.not.be.undefined;
          expect(tstCtrl.findTransaction, 'findTransaction method is undefined').to.exist;
          expect(tstCtrl.findAllRecentTransactions, 'findAllRecentTransactions method is undefined').to.exist;
          // expect(tstCtrl.updatePayee, 'updatePayee method is undefined').to.exist;
          expect(tstCtrl.createTransaction, 'createTransaction method is undefined').to.exist;
          // expect(tstCtrl.deletePayee, 'deletePayee method is undefined').to.exist;
      });

  //SETUP STUBS
      before(function() {
        mockFind = {
          limit: function() {return this;},
          sort:  function() {return this;},
          exec:  function(callback) {
            callback(null, [{"_id":"58544c4cecc68db2094363a7","account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}},
                                   {"_id":"58544c4cecc68db2094363a7","account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}},
                                   {"_id":"58544c4cecc68db2094363a7","account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}},
                                   {"_id":"58544c4cecc68db2094363a7","account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}}
                                 ]);;
          }
        }

        stubFind     = sinon.stub(transaction, 'find').returns(mockFind);
        stubFindById = sinon.stub(transaction, 'findById');
        stubSave     = sinon.stub(transaction.prototype, 'save');
        stubRemove   = sinon.stub(transaction.prototype, 'remove');
        stubUpdate   = sinon.stub(transaction, 'update');

        stubFindById.yields(null, {"_id":"58544c4cecc68db2094363a7","account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}});
        stubSave.yields(null, {"_id":"58544c4cecc68db2094363a7","account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}});
      })


  //FIND-ALL-RECENT-TRANSACTIONS
      it('should return valid JSON data from the findAllRecentTransactions function', function(done) {
          tstCtrl.findAllRecentTransactions("57a8c444eb388272368806b3", 5, function(err, data) {
              // console.log(err, data);
              expect(err, 'error was returned').to.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              expect(data.transactionList.length, 'empty records array was returned').to.be.above(0);
              expect(data.transactionList.length, 'empty records array was returned').to.be.below(5);
              expect(data.transactionList[0].id, 'no ID for the first transaction').to.exist;
              done();
          })
      })
      it('should return valid JSON error data from the findAllRecentTransactions function if no data is found', function(done) {
          mockFind = {
            limit: function() {return this;},
            sort:  function() {return this;},
            exec:  function(callback) {
              callback({'transactionError': {}}, null);
            }
          }
          transaction.find.restore();
          stubFind     = sinon.stub(transaction, 'find').returns(mockFind);
          tstCtrl.findAllRecentTransactions("57a8c444eb388272368806b3", 5, function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.be.null;
              done();
          })
      })


    //FIND-TRANSACTION-BY-ID
        it('should return valid JSON data from the findTransaction function', function(done) {
            tstCtrl.findTransaction('1234567890', function(err, data) {
                // console.log(err, data);
                expect(err, 'error was returned').to.be.null;
                expect(data, 'no data was returned').to.not.be.null;
                expect(data.transaction.id, 'no ID for the created transaction').to.exist;
                expect(data.transaction.account, 'no account for the created transaction').to.exist;
                expect(data.transaction.payee, 'no payee for the created transaction').to.exist;
                expect(data.transaction.amount, 'no amount for the created transaction').to.exist;
                expect(data.transaction.category, 'no category for the created transaction').to.exist;
                expect(data.transaction.isCleared, 'no isCleared for the created transaction').to.exist;
                expect(data.transaction.isPlaceholder, 'no isPlaceholder for the created transaction').to.exist;
                expect(data.transaction.notes, 'no notes for the created transaction').to.exist;
                expect(data.transaction.repeating, 'no repeating for the created transaction').to.exist;
                done();
            })
        })
        it('should return valid JSON error data from the findTransaction function if no data is found', function(done) {
            stubFindById.yields({'transactionError': {}}, null);
            tstCtrl.findTransaction('1234567890', function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.be.null;
                done();
            })
        })


    //CREATE-TRANSACTION
        it('should return valid JSON data from the createTransaction function', function(done) {
          let createBody = {"transaction":{"account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}}};

          tstCtrl.createTransaction(createBody, function(err, data) {
              // console.log(err, data);
              expect(err, 'error was returned').to.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              data.saveStatus.should.equal('created');
              expect(data.transaction.id, 'no ID for the created transaction').to.exist;
              expect(data.transaction.account, 'no account for the created transaction').to.exist;
              expect(data.transaction.payee, 'no payee for the created transaction').to.exist;
              expect(data.transaction.amount, 'no amount for the created transaction').to.exist;
              expect(data.transaction.category, 'no category for the created transaction').to.exist;
              expect(data.transaction.isCleared, 'no isCleared for the created transaction').to.exist;
              expect(data.transaction.isPlaceholder, 'no isPlaceholder for the created transaction').to.exist;
              expect(data.transaction.notes, 'no notes for the created transaction').to.exist;
              expect(data.transaction.repeating, 'no repeating for the created transaction').to.exist;
              done();
          })
        });
        it('should return valid JSON error data from the createTransaction function if there was a problem saving', function(done) {
            let createBody = {"transaction":{"account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}}};
            stubSave.yields({errCode: 1234, errDesc: 'made up error'}, null);
            tstCtrl.createTransaction(createBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.not.be.null;
                data.saveStatus.should.equal('failed create');
                done();
            })
        })
        it('should return valid JSON error data from the createTransaction function if no payee is supplied', function(done) {
            let createBody = {"transaction":{"account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}}};
            stubSave.yields({errCode: 1234, errDesc: 'made up error'}, null);
            tstCtrl.createTransaction(createBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.not.be.null;
                data.saveStatus.should.equal('failed create');
                done();
            })
        })


    //UPDATE-CATEGORY
      it('should return valid JSON data from the updateTransaction function', function(done) {
        let updateBody = {"transaction":{"_id":"5845c83f45aa390726439108", "account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":9999.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}}};
        let foundTrans = new transaction;
        foundTrans._id = '5845c83f45aa390726439108';
        foundTrans.account = {"account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"}};
        foundTrans.payee = {"name":"Tesco","id":"584f0408884e2dde51ce5f74"};
        foundTrans.amount = 100.00;
        foundTrans.category = {"name":"Food: Groceries","id":"582719a9ccf666abafab3394"};
        foundTrans.isCleared = false;
        foundTrans.isPlaceholder = false;
        foundTrans.notes = "";
        foundTrans.repeating = {"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null};
        stubFindById.yields(null, foundTrans);
        stubSave.yields(null, {"_id":"5845c83f45aa390726439108", "account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":9999.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}});

        tstCtrl.updateTransaction("5845c83f45aa390726439108", updateBody, function(err, data) {
            // console.log(err, data);
            expect(err, 'error was returned').to.be.null;
            expect(data, 'no data was returned').to.not.be.null;
            data.saveStatus.should.equal('updated');
            expect(data.transaction.id, 'no ID for the created transaction').to.exist;
            expect(data.transaction.account, 'no account for the created transaction').to.exist;
            expect(data.transaction.payee, 'no payee for the created transaction').to.exist;
            expect(data.transaction.amount, 'no amount for the created transaction').to.exist;
            expect(data.transaction.category, 'no category for the created transaction').to.exist;
            expect(data.transaction.isCleared, 'no isCleared for the created transaction').to.exist;
            expect(data.transaction.isPlaceholder, 'no isPlaceholder for the created transaction').to.exist;
            expect(data.transaction.notes, 'no notes for the created transaction').to.exist;
            expect(data.transaction.repeating, 'no repeating for the created transaction').to.exist;
            done();
        })
      });
      it('should return valid JSON error data from the updateTransaction function if the transaction to update was not found', function(done) {
        let updateBody = {"transaction":{"_id":"5845c83f45aa390726439108", "account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":9999.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}}};
        stubFindById.yields(null, null);
        tstCtrl.updateTransaction('5845c83f45aa390726439108', updateBody, function(err, data) {
            // console.log(err, data);
            expect(err, 'no error was returned').to.not.be.null;
            expect(data, 'some data was returned').to.not.be.null;
            data.saveStatus.should.equal('failed update');
            done();
          })
      })
      it('should return valid JSON error data from the updateTransaction function if there was a problem saving', function(done) {
          let updateBody = {"transaction":{"_id":"5845c83f45aa390726439108", "account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":9999.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}}};
          let foundTrans = new transaction;
          foundTrans._id = '5845c83f45aa390726439108';
          foundTrans.account = {"account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"}};
          foundTrans.payee = {"name":"Tesco","id":"584f0408884e2dde51ce5f74"};
          foundTrans.amount = 100.00;
          foundTrans.category = {"name":"Food: Groceries","id":"582719a9ccf666abafab3394"};
          foundTrans.isCleared = false;
          foundTrans.isPlaceholder = false;
          foundTrans.notes = "";
          foundTrans.repeating = {"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null};
          stubFindById.yields(null, foundTrans);
          stubSave.yields({errCode: 1234, errDesc: 'made up error'}, null);
          tstCtrl.updateTransaction('5845c83f45aa390726439108', updateBody, function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed update');
              done();
          })
      })
      it('should return valid JSON error data from the updateTransaction function if no transaction id is supplied', function(done) {
          let updateBody = {"transaction":{"account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":9999.99,"transactionDate": "2016-12-21T19:58:15.215Z","notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}}};
          tstCtrl.updateTransaction(null, updateBody, function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed update');
              done();
          })
      })


    //DELETE-CATEGORY
        it('should return valid JSON data from the deleteTransaction function', function(done) {
          let foundTrans = new transaction;
          foundTrans._id = '5845c83f45aa390726439108';
          foundTrans.account = {"account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"}};
          foundTrans.payee = {"name":"Tesco","id":"584f0408884e2dde51ce5f74"};
          foundTrans.amount = 100.00;
          foundTrans.category = {"name":"Food: Groceries","id":"582719a9ccf666abafab3394"};
          foundTrans.isCleared = false;
          foundTrans.isPlaceholder = false;
          foundTrans.notes = "";
          foundTrans.repeating = {"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null};
          stubFindById.yields(null, foundTrans);
          stubRemove.yields(null, null);
          tstCtrl.deleteTransaction('5845c83f45aa390726439108', function(err, data) {
              // console.log(err, data);
              expect(err, 'error was returned').to.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              data.saveStatus.should.equal('deleted');
              done();
          })
        })
        it('should return valid JSON error data from the deleteTransaction function if the transaction to delete was not found', function(done) {
          stubFindById.yields(null, null);
          tstCtrl.deleteTransaction('5845c83f45aa390726439108', function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed delete');
              done();
            })
        })
        it('should return valid JSON error data from the deleteTransaction function if the transaction was found but the delete operation failed', function(done) {
          let foundTrans = new transaction;
          foundTrans._id = '5845c83f45aa390726439108';
          foundTrans.account = {"account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"}};
          foundTrans.payee = {"name":"Tesco","id":"584f0408884e2dde51ce5f74"};
          foundTrans.amount = 100.00;
          foundTrans.category = {"name":"Food: Groceries","id":"582719a9ccf666abafab3394"};
          foundTrans.isCleared = false;
          foundTrans.isPlaceholder = false;
          foundTrans.notes = "";
          foundTrans.repeating = {"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null};
          stubFindById.yields(null, foundTrans);
          stubRemove.yields({'error': 'Error removing record from the database'}, null);
          tstCtrl.deleteTransaction('5845c83f45aa390726439108', function(err, data) {
              // console.log(err, data);
              expect(err, 'error was returned').to.not.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed delete');
              done();
          })
        })


    //RESET-STUBS
        after(function() {
          transaction.prototype.save.restore();
          transaction.prototype.remove.restore();
          transaction.update.restore();
          transaction.findById.restore();
          transaction.find.restore();
        });


})
