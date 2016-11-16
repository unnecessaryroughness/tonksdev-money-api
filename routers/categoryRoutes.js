const debug = require('debug')('tonksDEV:money:api:routing:category'),
    express = require('express');

const routes = function(moneyApiVars) {
    'use strict';

    const categoryRouter = express.Router(),
        categoryController = require('../controllers/catController')(moneyApiVars),
        accountController = require('../controllers/acctController')(moneyApiVars);

    const HATEOASProtocol = 'http://',
          HATEOASJunction = '/category/';

    categoryRouter.route('/')
        .get(function(req, res, next) {
            res.status(200).json({'availableFunctions': [
                  {'getAllCategories': HATEOASProtocol + req.headers.host + HATEOASJunction + 'allcategories'},
                  {'getCategoryById': HATEOASProtocol + req.headers.host + HATEOASJunction + '[category-id]'}
            ]})
        })
        .post(function(req, res, next) {
          accountController.findAccountGroup(req.headers.userid, req.body.category.accountGroup, null, function(err, categoryData) {
            if (err || !categoryData) {
              res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
            } else {
              //found category, so user has the authority to update it
              categoryController.createCategory(req.body, function(err, newCategory) {
                newCategory.category = addHATEOS(newCategory.category, req.headers.host);
                res.status(200).json(newCategory);
              })
            }
          })
        })


    categoryRouter.route('/allcategories/:gid')
        .get(function(req, res, next) {
            if (req.headers.userid) {
              //check that the current user is in the requested account group
              accountController.findAccountGroup(req.headers.userid, req.params.gid, null, function(err, groupData) {
                if (err || !groupData) {
                  res.status(err.number || 403).json({"error": "access denied", "errDetails": err})
                } else {
                  //get all categories from that account group
                  categoryController.findAllCategories(req.params.gid, function(err, catData) {
                    if (err || !catData) {
                      res.status(err.number || 404).json({"error": "could not find any categories", "errDetails" : err});
                    } else {
                      catData.categoryList.forEach(function(val, idx, arr) {
                          val = addHATEOS(val, req.headers.host);
                      });
                      res.status(200).json(catData);
                    }
                  });
                }
              });
            }
      });


    categoryRouter.route('/:cid')
      .get(function(req, res, next) {
          findAndValidateCategory(req.headers.userid, req.params.cid, function(err, categoryData) {
            if (err || !categoryData) {
              res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
            } else {
              categoryData.category = addHATEOS(categoryData.category, req.headers.host);
              res.status(200).json(categoryData);
            }
          })
        })
      .put(function(req, res, next) {
        findAndValidateCategory(req.headers.userid, req.params.cid, function(err, categoryData) {
          if (err || !categoryData) {
            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
          } else {
            //found category, so user has the authority to update it
            categoryController.updateCategory(req.params.cid, req.body, function(err, updatedCategory) {
              updatedCategory.category = addHATEOS(updatedCategory.category, req.headers.host);
              res.status(200).json(updatedCategory);
            })
          }
        })
      })
      .delete(function(req, res, next) {
        findAndValidateCategory(req.headers.userid, req.params.cid, function(err, categoryData) {
          if (err || !categoryData) {
            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
          } else {
            //found category, so user has the authority to update it
            categoryController.deleteCategory(req.params.cid, req.body, function(err, data) {
              res.status(200).json(data);
            })
          }
        })
      });


    function findAndValidateCategory(uid, cid, done) {
      //check the category exists
      categoryController.findCategory(cid, function(err, categoryData) {
          if (err || !categoryData) {
            done({"error": "category was not found", "categoryid": cid, "errDetails" : err}, null);
          } else {
            //check that the user is in the account group for the category
            accountController.findAccountGroup(uid, categoryData.category.accountGroup, null, function(err, groupData) {
              if (err || !groupData) {
                done({"error": "access denied", "errDetails" : err}, null);
              } else {
                done(null, categoryData);
              }
            })
          }
      })
    }


    function addHATEOS(catRecord, hostAddress) {
      catRecord.links.self = HATEOASProtocol + hostAddress + HATEOASJunction + catRecord.id;
      return catRecord;
    }

    return categoryRouter;
};

module.exports = routes;
