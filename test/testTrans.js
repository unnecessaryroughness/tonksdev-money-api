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

  let tstCtrl, stubFind, stubFindById, stubFindOne, stubSave, stubRemove, stubUpdate;;

  beforeEach(function() {
      tstCtrl = new ctrl({});
  });

  //TEST APPLICATION
      it('should load the controller cleanly and create a usable application object', function() {
          expect(tstCtrl, 'controller is undefined').to.not.be.undefined;
          // expect(tstCtrl.findPayee, 'findPayee method is undefined').to.exist;
          // expect(tstCtrl.updatePayee, 'updatePayee method is undefined').to.exist;
          expect(tstCtrl.createTransaction, 'createTransaction method is undefined').to.exist;
          // expect(tstCtrl.deletePayee, 'deletePayee method is undefined').to.exist;
          // expect(tstCtrl.findAllPayees, 'findAllPayees method is undefined').to.exist;
      });

  //SETUP STUBS
      before(function() {
        stubFind     = sinon.stub(transaction, 'find');
        stubFindById = sinon.stub(transaction, 'findById');
        stubSave     = sinon.stub(transaction.prototype, 'save');
        stubRemove   = sinon.stub(transaction.prototype, 'remove');
        stubUpdate   = sinon.stub(transaction, 'update');

        // stubFind.yields(null, [{"_id":"58271954ccf666abafab3393","payeeName":"Tesco","accountGroup":"57a8c444eb388272368806b3"},
        //                        {"_id":"582719a9ccf666abafab3394","payeeName":"Sainsburys","accountGroup":"57a8c444eb388272368806b3"},
        //                        {"_id":"582719b2ccf666abafab3395","payeeName":"WH Smith","accountGroup":"57a8c444eb388272368806b3"},
        //                        {"_id":"582719b9ccf666abafab3396","payeeName":"Costa Coffee","accountGroup":"57a8c444eb388272368806b3"}]);

        //  stubFindById.yields(null, {"_id":"58271954ccf666abafab3393","payeeName":"Tesco","accountGroup":"57a8c444eb388272368806b3"});

         stubSave.yields(null, {"_id":"58544c4cecc68db2094363a7","account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}});
      })


  //FIND-ALL-CATEGORIES
      // it('should return valid JSON data from the findAllPayees function', function(done) {
      //     tstCtrl.findAllPayees("57a8c444eb388272368806b3", function(err, data) {
      //         // console.log(err, data);
      //         expect(err, 'error was returned').to.be.null;
      //         expect(data, 'no data was returned').to.not.be.null;
      //         expect(data.payeeList.length, 'empty records array was returned').to.be.above(0);
      //         expect(data.payeeList[0].id, 'no ID for the first payee').to.exist;
      //         expect(data.payeeList[0].accountGroup, 'no accountGroup for the first payee').to.exist;
      //         done();
      //     })
      // })
      // it('should return valid JSON error data from the findAllPayees function if no data is found', function(done) {
      //     stubFind.yields({'payeeError': {}}, null);
      //     tstCtrl.findAllPayees("57a8c444eb388272368806b3", function(err, data) {
      //         // console.log(err, data);
      //         expect(err, 'no error was returned').to.not.be.null;
      //         expect(data, 'some data was returned').to.be.null;
      //         done();
      //     })
      // })


    //FIND-CATEGORY-BY-ID
        // it('should return valid JSON data from the findPayee function', function(done) {
        //     tstCtrl.findPayee('1234567890', function(err, data) {
        //         // console.log(err, data);
        //         expect(err, 'error was returned').to.be.null;
        //         expect(data, 'no data was returned').to.not.be.null;
        //         expect(data.payee.id, 'no ID for the payee').to.exist;
        //         expect(data.payee.payeeName, 'no payeeName for the payee').to.exist;
        //         expect(data.payee.accountGroup, 'no accountGroup for the payee').to.exist;
        //         done();
        //     })
        // })
        // it('should return valid JSON error data from the findPayee function if no data is found', function(done) {
        //     stubFindById.yields({'payeeError': {}}, null);
        //     tstCtrl.findPayee('1234567890', function(err, data) {
        //         // console.log(err, data);
        //         expect(err, 'no error was returned').to.not.be.null;
        //         expect(data, 'some data was returned').to.be.null;
        //         done();
        //     })
        // })


    //CREATE-TRANSACTION
        it('should return valid JSON data from the createTransaction function', function(done) {
          let createBody = {"transaction":{"account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}}};

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
            let createBody = {"transaction":{"account":{"group":{"id":"57a8c444eb388272368806b3","code":"FAMILY"},"id":"579a5a314a4eff2f21d5a109","code":"FDMARK"},"payee":{"name":"Tesco","id":"584f0408884e2dde51ce5f74"},"category":{"name":"Food: Groceries","id":"582719a9ccf666abafab3394"},"amount":100.99,"notes":"Second transaction","isCleared":false,"isPlaceholder":false,"repeating":{"frequency":{"increment":0,"code":""},"endOnDate":null,"prevDate":null,"nextDate":null}}};
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
        // it('should return valid JSON data from the updatePayee function', function(done) {
        //   let updateBody = {"payee": {"payeeName": "Caffe Nero", "accountGroup": "57a8c444eb388272368806b3"}};
        //   let foundPayee = new payee;
        //   foundPayee._id = '5845c83f45aa390726439108';
        //   foundPayee.payeeName = 'Starbucks';
        //   foundPayee.accountGroup = '57a8c444eb388272368806b3';
        //   stubFindById.yields(null, foundPayee);
        //   stubSave.yields(null, {"_id":"5845c83f45aa390726439108","payeeName":"Caffe Nero","accountGroup":"57a8c444eb388272368806b3"})
        //
        //   tstCtrl.updatePayee('5845c83f45aa390726439108', updateBody, function(err, data) {
        //     // console.log(err, data);
        //     expect(err, 'error was returned').to.be.null;
        //     expect(data, 'no data was returned').to.not.be.null;
        //     data.saveStatus.should.equal('updated');
        //     expect(data.payee.id, 'no ID for the created payee').to.exist;
        //     expect(data.payee.payeeName, 'no payeeName for the created payee').to.exist;
        //     expect(data.payee.accountGroup, 'no accountGroup for the created payee').to.exist;
        //     done();
        //   });
        // });
        // it('should return valid JSON error data from the updatePayee function if the payee to update was not found', function(done) {
        //   let updateBody = {"payee": {"payeeName": "Caffe Nero", "accountGroup": "57a8c444eb388272368806b3"}};
        //   stubFindById.yields(null, null);
        //   tstCtrl.updatePayee('5845c83f45aa390726439108', updateBody, function(err, data) {
        //       // console.log(err, data);
        //       expect(err, 'no error was returned').to.not.be.null;
        //       expect(data, 'some data was returned').to.not.be.null;
        //       data.saveStatus.should.equal('failed update');
        //       done();
        //     })
        // })
        // it('should return valid JSON error data from the updatePayee function if the payee was found but the update failed', function(done) {
        //   let updateBody = {"payee": {"payeeName": "Caffe Nero", "accountGroup": "57a8c444eb388272368806b3"}};
        //   let foundPayee = new payee;
        //   foundPayee._id = '5845c83f45aa390726439108';
        //   foundPayee.payeeName = 'Starbucks';
        //   foundPayee.accountGroup = '57a8c444eb388272368806b3';
        //   stubFindById.yields(null, foundPayee);
        //   stubSave.yields({'error': 'Error saving record to the database'}, null);
        //
        //   tstCtrl.updatePayee('5845c83f45aa390726439108', updateBody, function(err, data) {
        //       // console.log(err, data);
        //       expect(err, 'no error was returned').to.not.be.null;
        //       expect(data, 'some data was returned').to.not.be.null;
        //       data.saveStatus.should.equal('failed update');
        //       done();
        //     })
        // })


    //DELETE-CATEGORY
        // it('should return valid JSON data from the deletePayee function', function(done) {
        //   let foundPayee = new payee;
        //   foundPayee._id = '5845c83f45aa390726439108';
        //   foundPayee.payeeName = 'Starbucks';
        //   foundPayee.accountGroup = '57a8c444eb388272368806b3';
        //   stubFindById.yields(null, foundPayee);
        //   stubRemove.yields(null, null);
        //
        //   tstCtrl.deletePayee('5845c83f45aa390726439108', function(err, data) {
        //       // console.log(err, data);
        //       expect(err, 'error was returned').to.be.null;
        //       expect(data, 'no data was returned').to.not.be.null;
        //       data.saveStatus.should.equal('deleted');
        //       done();
        //   })
        // })
        // it('should return valid JSON error data from the deletePayee function if the payee to delete was not found', function(done) {
        //   stubFindById.yields(null, null);
        //   tstCtrl.deletePayee('5845c83f45aa390726439108', function(err, data) {
        //       // console.log(err, data);
        //       expect(err, 'no error was returned').to.not.be.null;
        //       expect(data, 'some data was returned').to.not.be.null;
        //       data.saveStatus.should.equal('failed delete');
        //       done();
        //     })
        // })
        // it('should return valid JSON error data from the deletePayee function if the payee was found but the delete operation failed', function(done) {
        //   let foundPayee = new payee;
        //   foundPayee._id = '5845c83f45aa390726439108';
        //   foundPayee.payeeName = 'Starbucks';
        //   foundPayee.accountGroup = '57a8c444eb388272368806b3';
        //   stubFindById.yields(null, foundPayee);
        //   stubRemove.yields({'error': 'Error removing record from the database'}, null);
        //   tstCtrl.deletePayee('5845c83f45aa390726439108', function(err, data) {
        //       // console.log(err, data);
        //       expect(err, 'no error was returned').to.not.be.null;
        //       expect(data, 'some data was returned').to.not.be.null;
        //       data.saveStatus.should.equal('failed delete');
        //       done();
        //     })
        // })


    //RESET-STUBS
        after(function() {
          transaction.prototype.save.restore();
          transaction.prototype.remove.restore();
          transaction.update.restore();
          transaction.findById.restore();
          transaction.find.restore();
        });


})
