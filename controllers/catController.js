const mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:controller:category'),
    constructErrReturnObj = require('../common/moneyErrorObj'),
    category = require('../models/categoryModel');

const controller = function(moneyApiVars) {
  'use strict';

  const findCategory = function(cid, done) {
      category.findById(cid, function(err, foundCategory) {
          if (err || !foundCategory) {
              done(constructErrReturnObj(err, 'could not find category', 404), null);
          } else {
              done(null, {'category': constructCategoryObjectForRead(foundCategory)});
          }
      })
  }


  const createCategory = function(reqBody, done) {
    if (reqBody.category.categoryName && reqBody.category.accountGroup) {
      let newCategory = constructCategoryObjectForSave(reqBody.category);
      newCategory.save(function(err, savedCategory) {
          if (err) {
            done(constructErrReturnObj(err, 'error saving new category', 500), {'saveStatus': 'failed create'});
          } else {
            done(null, {'saveStatus': 'created', 'category': constructCategoryObjectForRead(savedCategory)});
          }
      });
    } else {
      done(constructErrReturnObj(null, 'categoryName and accountGroup were not supplied', 500), {'saveStatus': 'failed'});
    }
  }


  const updateCategory = function(cid, reqBody, done) {
    if (cid && reqBody) {
      category.findById(cid, function(err, foundCategory) {
        if (err || !foundCategory) {
          done(constructErrReturnObj(err, 'category could not be found in the database', 404), {'saveStatus': 'failed update'});
        } else {
          let updatedCategory = constructCategoryObjectForUpdate(foundCategory, reqBody.category);
          updatedCategory.save(function(err, savedCategory) {
              if (err) {
                done(constructErrReturnObj(err, 'category record could not be updated in the database', 400), {'saveStatus': 'failed update'});
              } else {
                done(null, {'saveStatus': 'updated', 'category': constructCategoryObjectForRead(savedCategory)});
              }
          })
        }
      });
    }
  }


  const deleteCategory = function(cid, done) {
    if (cid) {
      category.findById(cid, function(err, foundCategory) {
        if (err || !foundCategory) {
          done(constructErrReturnObj(err, 'category could not be found in the database', 404), {'saveStatus': 'failed delete'});
        } else {
          foundCategory.remove(function(err) {
            if (err) {
              done(constructErrReturnObj(err, 'error removing category from database', 500), {'saveStatus': 'failed delete'});
            } else {
              done(null, {'saveStatus': 'deleted'});
            }
          })
        }
      });
    }
  }

  const findAllCategories = function(acctGroup, done) {
      category.find({'accountGroup': acctGroup}, function(err, foundCategories) {
        if (err || !foundCategories) {
            done(constructErrReturnObj(err, 'could not find any categories', 404), null);
        } else {
            done(null, {'categoryList': constructCategoryList(foundCategories)});
        }
      })
  }


  const constructCategoryObjectForRead = function(catFromDB) {
      let rtnCat = {id: null};
      if (catFromDB) {
          rtnCat.id = catFromDB._id;
          rtnCat.categoryName = catFromDB.categoryName;
          rtnCat.accountGroup = catFromDB.accountGroup;
          rtnCat.links = {};
      }
      return rtnCat;
  }

  const constructCategoryList = function(catListFromDB) {
      let rtnCatList = [];
      if (catListFromDB && catListFromDB.length > 0) {
          catListFromDB.forEach(function(val, idx, arr) {
              rtnCatList.push(constructCategoryObjectForRead(val));
          })
      }
      return rtnCatList;
  }

  const constructCategoryObjectForSave = function(categoryFromApp) {
      let newCategory = new category;
      if (categoryFromApp) {
          newCategory.categoryName = categoryFromApp.categoryName;
          newCategory.accountGroup = categoryFromApp.accountGroup;
      }
      return newCategory;
  }

  const constructCategoryObjectForUpdate = function(categoryObject, categoryFromApp) {
      if (categoryFromApp) {
          if (categoryFromApp.categoryName) categoryObject.categoryName = categoryFromApp.categoryName;
          if (categoryFromApp.accountGroup) categoryObject.accountGroup = categoryFromApp.accountGroup;
      }
      return categoryObject;
  }


  return {
    findCategory: findCategory,
    updateCategory: updateCategory,
    createCategory: createCategory,
    deleteCategory: deleteCategory,
    findAllCategories: findAllCategories
  }
}

module.exports = controller;
