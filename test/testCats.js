'use strict';

const sinon = require('sinon'),
      chai = require('chai'),
      expect = chai.expect,
      assert = chai.assert,
      ctrl = require('../controllers/catController'),
      category = require('../models/categoryModel.js'),
      supertest = require('supertest');

chai.should();

describe('"Category" functional testing', function() {

  let tstCtrl, stubFind, stubFindById, stubFindOne, stubSave, stubRemove, stubUpdate;;

  beforeEach(function() {
      tstCtrl = new ctrl({});
  });

  //TEST APPLICATION
      it('should load the controller cleanly and create a usable application object', function() {
          expect(tstCtrl, 'controller is undefined').to.not.be.undefined;
          expect(tstCtrl.findCategory, 'findCategory method is undefined').to.exist;
          expect(tstCtrl.updateCategory, 'updateCategory method is undefined').to.exist;
          expect(tstCtrl.createCategory, 'createCategory method is undefined').to.exist;
          expect(tstCtrl.deleteCategory, 'deleteCategory method is undefined').to.exist;
          expect(tstCtrl.findAllCategories, 'findAllCategories method is undefined').to.exist;
      });

  //SETUP STUBS
      before(function() {
        stubFind     = sinon.stub(category, 'find');
        stubFindById = sinon.stub(category, 'findById');
        stubSave     = sinon.stub(category.prototype, 'save');
        stubRemove   = sinon.stub(category.prototype, 'remove');
        stubUpdate   = sinon.stub(category, 'update');

        stubFind.yields(null, [{"_id":"58271954ccf666abafab3393","categoryName":"Food and Drinkies","accountGroup":"57a8c444eb388272368806b3"},
                               {"_id":"582719a9ccf666abafab3394","categoryName":"Food: Groceries","accountGroup":"57a8c444eb388272368806b3"},
                               {"_id":"582719b2ccf666abafab3395","categoryName":"Food: Dining","accountGroup":"57a8c444eb388272368806b3"},
                               {"_id":"582719b9ccf666abafab3396","categoryName":"Food: Snacks","accountGroup":"57a8c444eb388272368806b3"}]);

         stubFindById.yields(null, {"_id":"58271954ccf666abafab3393","categoryName":"Food and Drinkies","accountGroup":"57a8c444eb388272368806b3"});

         stubSave.yields(null, {"_id":"5845c83f45aa390726439108","categoryName":"Bills: Mortgage","accountGroup":"57a8c444eb388272368806b3"})
      })


  //FIND-ALL-CATEGORIES
      it('should return valid JSON data from the findAllCategories function', function(done) {
          tstCtrl.findAllCategories("57a8c444eb388272368806b3", function(err, data) {
              // console.log(err, data);
              expect(err, 'error was returned').to.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              expect(data.categoryList.length, 'empty records array was returned').to.be.above(0);
              expect(data.categoryList[0].id, 'no ID for the first category').to.exist;
              expect(data.categoryList[0].accountGroup, 'no accountGroup for the first category').to.exist;
              done();
          })
      })
      it('should return valid JSON error data from the findAllCategories function if no data is found', function(done) {
          stubFind.yields({'catError': {}}, null);
          tstCtrl.findAllCategories("57a8c444eb388272368806b3", function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.be.null;
              done();
          })
      })


    //FIND-CATEGORY-BY-ID
        it('should return valid JSON data from the findCategory function', function(done) {
            tstCtrl.findCategory('1234567890', function(err, data) {
                // console.log(err, data);
                expect(err, 'error was returned').to.be.null;
                expect(data, 'no data was returned').to.not.be.null;
                expect(data.category.id, 'no ID for the category').to.exist;
                expect(data.category.categoryName, 'no categoryName for the category').to.exist;
                expect(data.category.accountGroup, 'no accountGroup for the category').to.exist;
                done();
            })
        })
        it('should return valid JSON error data from the findCategory function if no data is found', function(done) {
            stubFindById.yields({'catError': {}}, null);
            tstCtrl.findCategory('1234567890', function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.be.null;
                done();
            })
        })


    //CREATE-CATEGORY
        it('should return valid JSON data from the createCategory function', function(done) {
          let createBody = {"category": {"categoryName": "Bills: Mortgage", "accountGroup": "57a8c444eb388272368806b3"}};

          tstCtrl.createCategory(createBody, function(err, data) {
              // console.log(err, data);
              expect(err, 'error was returned').to.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              data.saveStatus.should.equal('created');
              expect(data.category.id, 'no ID for the created category').to.exist;
              expect(data.category.categoryName, 'no categoryName for the created category').to.exist;
              expect(data.category.accountGroup, 'no accountGroup for the created category').to.exist;
              done();
          })
        });
        it('should return valid JSON error data from the createCategory function if there was a problem saving', function(done) {
            let createBody = {"category": {"categoryName": "Bills: Mortgage", "accountGroup": "57a8c444eb388272368806b3"}};
            stubSave.yields({errCode: 1234, errDesc: 'made up error'}, null);
            tstCtrl.createCategory(createBody, function(err, data) {
                // console.log(err, data);
                expect(err, 'no error was returned').to.not.be.null;
                expect(data, 'some data was returned').to.not.be.null;
                data.saveStatus.should.equal('failed create');
                done();
            })
        })


    //UPDATE-CATEGORY
        it('should return valid JSON data from the updateCategory function', function(done) {
          let updateBody = {"category": {"categoryName": "Bills: Bank", "accountGroup": "57a8c444eb388272368806b3"}};
          let foundCat = new category;
          foundCat._id = '5845c83f45aa390726439108';
          foundCat.categoryName = 'Bills: Mortgage';
          foundCat.accountGroup = '57a8c444eb388272368806b3';
          stubFindById.yields(null, foundCat);
          stubSave.yields(null, {"_id":"5845c83f45aa390726439108","categoryName":"Bills: Bank","accountGroup":"57a8c444eb388272368806b3"})

          tstCtrl.updateCategory('5845c83f45aa390726439108', updateBody, function(err, data) {
            // console.log(err, data);
            expect(err, 'error was returned').to.be.null;
            expect(data, 'no data was returned').to.not.be.null;
            data.saveStatus.should.equal('updated');
            expect(data.category.id, 'no ID for the created category').to.exist;
            expect(data.category.categoryName, 'no categoryName for the created category').to.exist;
            expect(data.category.accountGroup, 'no accountGroup for the created category').to.exist;
            done();
          });
        });
        it('should return valid JSON error data from the updateCategory function if the category to update was not found', function(done) {
          let updateBody = {"category": {"categoryName": "Bills: Bank", "accountGroup": "57a8c444eb388272368806b3"}};
          stubFindById.yields(null, null);
          tstCtrl.updateCategory('5845c83f45aa390726439108', updateBody, function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed update');
              done();
            })
        })
        it('should return valid JSON error data from the updateCategory function if the category was found but the update failed', function(done) {
          let updateBody = {"category": {"categoryName": "Bills: Bank", "accountGroup": "57a8c444eb388272368806b3"}};
          let foundCat = new category;
          foundCat._id = '5845c83f45aa390726439108';
          foundCat.categoryName = 'Bills: Mortgage';
          foundCat.accountGroup = '57a8c444eb388272368806b3';
          stubFindById.yields(null, foundCat);
          stubSave.yields({'error': 'Error saving record to the database'}, null);

          tstCtrl.updateCategory('5845c83f45aa390726439108', updateBody, function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed update');
              done();
            })
        })


    //DELETE-CATEGORY
        it('should return valid JSON data from the deleteCategory function', function(done) {
          let foundCat = new category;
          foundCat._id = '5845c83f45aa390726439108';
          foundCat.categoryName = 'Bills: Mortgage';
          foundCat.accountGroup = '57a8c444eb388272368806b3';
          stubFindById.yields(null, foundCat);
          stubRemove.yields(null, null);

          tstCtrl.deleteCategory('5845c83f45aa390726439108', function(err, data) {
              // console.log(err, data);
              expect(err, 'error was returned').to.be.null;
              expect(data, 'no data was returned').to.not.be.null;
              data.saveStatus.should.equal('deleted');
              done();
          })
        })
        it('should return valid JSON error data from the deleteCategory function if the category to delete was not found', function(done) {
          stubFindById.yields(null, null);
          tstCtrl.deleteCategory('5845c83f45aa390726439108', function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed delete');
              done();
            })
        })
        it('should return valid JSON error data from the deleteCategory function if the category was found but the delete operation failed', function(done) {
          let foundCat = new category;
          foundCat._id = '5845c83f45aa390726439108';
          foundCat.categoryName = 'Bills: Mortgage';
          foundCat.accountGroup = '57a8c444eb388272368806b3';
          stubFindById.yields(null, foundCat);
          stubRemove.yields({'error': 'Error removing record from the database'}, null);
          tstCtrl.deleteCategory('5845c83f45aa390726439108', function(err, data) {
              // console.log(err, data);
              expect(err, 'no error was returned').to.not.be.null;
              expect(data, 'some data was returned').to.not.be.null;
              data.saveStatus.should.equal('failed delete');
              done();
            })
        })


    //RESET-STUBS
        after(function() {
          category.prototype.save.restore();
          category.prototype.remove.restore();
          category.findById.restore();
          category.find.restore();
        });


})
