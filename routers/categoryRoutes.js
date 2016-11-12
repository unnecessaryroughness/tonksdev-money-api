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
        // .post(function(req, res, next) {
            // if (req.headers.userid === moneyApiVars.systemacc) {
            //   userController.createUser(req.body, function(err, data) {
            //       if (!err && data.saveStatus === 'created') {
            //           res.status(200).json(data);
            //       } else {
            //           res.status(500).json({"error": "error creating new user", "errDetails" : err});
            //       }
            //   })
            // } else {
            //   res.status(403).json({"error": "access denied", "errDetails" : null});
            // }
        // });


    categoryRouter.route('/allcategories/:gid')
        .get(function(req, res, next) {
            if (req.headers.userid) {
              //check that the current user is in the requested account group
              accountController.findAccountGroup(req.headers.userid, req.params.gid, null, function(err, groupData) {
                if (err || !groupData) {
                  res.status(err.number || 500).json({"error": "access denied", "errDetails": err})
                } else {
                  //get all categories from that account group
                  categoryController.findAllCategories(req.params.gid, function(err, catData) {
                    if (err || !catData) {
                      res.status(err.number || 500).json({"error": "error accessing category data", "errDetails" : err});
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


    // categoryRouter.route('/:cid')
    //   .get(function(req, res, next) {
      //     if (req.headers.userid === moneyApiVars.systemacc || req.headers.userid === req.params.uid) {
      //       userController.findUser(req.params.uid, function(err, userData) {
      //           if (err || !userData) {
      //             res.status(500).json({"error": "user was not found", "userid":req.params.uid, "errDetails" : err});
      //           } else {
      //             userData.user = addHATEOS(userData.user, req.headers.host);
      //             res.status(200).json(userData);
      //           }
      //       })
      //     } else {
      //       res.status(403).json({"error": "access denied", "errDetails" : null});
      //     }
      //   })
      // .put(function(req, res, next) {
      //   if (req.headers.userid === moneyApiVars.systemacc || req.headers.userid === req.params.uid) {
      //     userController.updateUser(req.params.uid, req.body, function(err, data) {
      //       if (!err && data.saveStatus === 'updated') {
      //           res.status(200).json(data);
      //       } else {
      //           res.status(500).json(err);
      //       }
      //     })
      //   } else {
      //     res.status(403).json({"error": "access denied", "errDetails" : null});
      //   }
      // })
      // .delete(function(req, res, next) {
      //   if (req.headers.userid === moneyApiVars.systemacc) {
      //     userController.deleteUser(req.params.uid, function(err, data) {
      //         if(!err && data.saveStatus === 'deleted') {
      //             res.status(200).json(data);
      //         } else {
      //             res.status(500).json(err);
      //         }
      //     })
      //   } else {
      //     res.status(403).json({"error": "access denied", "errDetails" : null});
      //   }
      // });


    function addHATEOS(catRecord, hostAddress) {
      catRecord.links.self = HATEOASProtocol + hostAddress + HATEOASJunction + catRecord.id;
      return catRecord;
    }

    return categoryRouter;
};

module.exports = routes;
