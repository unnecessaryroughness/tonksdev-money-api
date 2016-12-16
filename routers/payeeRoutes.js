const debug = require('debug')('tonksDEV:money:api:routing:payee'),
    express = require('express');

const routes = function(moneyApiVars) {
    'use strict';

    const payeeRouter = express.Router(),
        payeeController = require('../controllers/payeeController')(moneyApiVars),
        accountController = require('../controllers/acctController')(moneyApiVars);

    const HATEOASProtocol = 'http://',
          HATEOASJunction = '/payee/';

    payeeRouter.route('/')
        .get(function(req, res, next) {
            res.status(200).json({'availableFunctions': [
                  {'getAllPayees': HATEOASProtocol + req.headers.host + HATEOASJunction + 'allpayees/[account-group-id]'},
                  {'getPayeeById': HATEOASProtocol + req.headers.host + HATEOASJunction + '[payee-id]'}
            ]})
        })
        .post(function(req, res, next) {
          accountController.findAccountGroup(req.headers.userid, req.body.payee.accountGroup, null, function(err, groupData) {
            if (err || !groupData) {
              res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
            } else {
              //found payee, so user has the authority to update it
              payeeController.createPayee(req.body, function(err, newPayee) {
                newPayee.payee = addHATEOS(newPayee.payee, req.headers.host);
                res.status(200).json(newPayee);
              })
            }
          })
        })


    payeeRouter.route('/allpayees/:gid')
        .get(function(req, res, next) {
            if (req.headers.userid) {
              //check that the current user is in the requested account group
              accountController.findAccountGroup(req.headers.userid, req.params.gid, null, function(err, groupData) {
                if (err || !groupData) {
                  res.status(err.number || 403).json({"error": "access denied", "errDetails": err})
                } else {
                  //get all payees from that account group
                  payeeController.findAllPayees(req.params.gid, function(err, payeeData) {
                    if (err || !payeeData) {
                      res.status(err.number || 404).json({"error": "could not find any payees", "errDetails" : err});
                    } else {
                      payeeData.payeeList.forEach(function(val, idx, arr) {
                          val = addHATEOS(val, req.headers.host);
                      });
                      res.status(200).json(payeeData);
                    }
                  });
                }
              });
            }
      });


    payeeRouter.route('/:pid')
      .get(function(req, res, next) {
          findAndValidatePayee(req.headers.userid, req.params.pid, function(err, payeeData) {
            if (err || !payeeData) {
              res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
            } else {
              payeeData.payee = addHATEOS(payeeData.payee, req.headers.host);
              res.status(200).json(payeeData);
            }
          })
        })
      .put(function(req, res, next) {
        findAndValidatePayee(req.headers.userid, req.params.pid, function(err, payeeData) {
          if (err || !payeeData) {
            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
          } else {
            //found payee, so user has the authority to update it
            payeeController.updatePayee(req.params.pid, req.body, function(err, updatedPayee) {
              updatedPayee.payee = addHATEOS(updatedPayee.payee, req.headers.host);
              res.status(200).json(updatedPayee);
            })
          }
        })
      })
      .delete(function(req, res, next) {
        findAndValidatePayee(req.headers.userid, req.params.pid, function(err, payeeData) {
          if (err || !payeeData) {
            res.status(err.number || 403).json({"error": "access denied", "errDetails" : err});
          } else {
            //found payee, so user has the authority to update it
            payeeController.deletePayee(req.params.pid, function(err, data) {
              res.status(200).json(data);
            })
          }
        })
      });


    function findAndValidatePayee(uid, pid, done) {
      //check the payee exists
      payeeController.findPayee(pid, function(err, payeeData) {
          if (err || !payeeData) {
            done({"error": "payee was not found", "payeeid": pid, "errDetails" : err}, null);
          } else {
            //check that the user is in the account group for the payee
            accountController.findAccountGroup(uid, payeeData.payee.accountGroup, null, function(err, groupData) {
              if (err || !groupData) {
                done({"error": "access denied", "errDetails" : err}, null);
              } else {
                done(null, payeeData);
              }
            })
          }
      })
    }


    function addHATEOS(payeeRecord, hostAddress) {
      payeeRecord.links.self = HATEOASProtocol + hostAddress + HATEOASJunction + payeeRecord.id;
      return payeeRecord;
    }

    return payeeRouter;
};

module.exports = routes;
