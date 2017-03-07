const mongoose = require('mongoose'),
    debug = require('debug')('tonksDEV:money:api:controller:payee'),
    constructErrReturnObj = require('../common/moneyErrorObj'),
    payee = require('../models/payeeModel');

const controller = function(moneyApiVars) {
  'use strict';

  const findPayee = function(pid, done) {
      payee.findById(pid, function(err, foundPayee) {
          if (err || !foundPayee) {
              done(constructErrReturnObj(err, 'could not find payee', 404), null);
          } else {
              done(null, {'payee': constructPayeeObjectForRead(foundPayee)});
          }
      })
  }


  const createPayee = function(reqBody, done) {
    if (reqBody.payee.payeeName && reqBody.payee.accountGroup) {
      let newPayee = constructPayeeObjectForSave(reqBody.payee);
      newPayee.save(function(err, savedPayee) {
          if (err) {
            done(constructErrReturnObj(err, 'error saving new payee', 500), {'saveStatus': 'failed create'});
          } else {
            done(null, {'saveStatus': 'created', 'payee': constructPayeeObjectForRead(savedPayee)});
          }
      });
    } else {
      done(constructErrReturnObj(null, 'payeeName and accountGroup were not supplied', 500), {'saveStatus': 'failed'});
    }
  }


  const updatePayee = function(pid, reqBody, done) {
    if (pid && reqBody) {
      payee.findById(pid, function(err, foundPayee) {
        if (err || !foundPayee) {
          done(constructErrReturnObj(err, 'payee could not be found in the database', 404), {'saveStatus': 'failed update'});
        } else {
          let updatedPayee = constructPayeeObjectForUpdate(foundPayee, reqBody.payee);
          updatedPayee.save(function(err, savedPayee) {
              if (err) {
                done(constructErrReturnObj(err, 'payee record could not be updated in the database', 400), {'saveStatus': 'failed update'});
              } else {
                done(null, {'saveStatus': 'updated', 'payee': constructPayeeObjectForRead(savedPayee)});
              }
          })
        }
      });
    }
  }


  const deletePayee = function(pid, done) {
    if (pid) {
      payee.findById(pid, function(err, foundPayee) {
        if (err || !foundPayee) {
          done(constructErrReturnObj(err, 'payee could not be found in the database', 404), {'saveStatus': 'failed delete'});
        } else {
          foundPayee.remove(function(err) {
            if (err) {
              done(constructErrReturnObj(err, 'error removing payee from database', 500), {'saveStatus': 'failed delete'});
            } else {
              done(null, {'saveStatus': 'deleted'});
            }
          })
        }
      });
    }
  }

  const findAllPayees = function(acctGroup, done) {
      payee.find({'accountGroup': acctGroup}, null, {sort: {payeeName: 1}}, function(err, foundPayees) {
        if (err || !foundPayees) {
            done(constructErrReturnObj(err, 'could not find any payees', 404), null);
        } else {
            done(null, {'payeeList': constructPayeeList(foundPayees)});
        }
      })
  }


  const constructPayeeObjectForRead = function(payeeFromDB) {
      let rtnPayee = {id: null};
      if (payeeFromDB) {
          rtnPayee.id = payeeFromDB._id;
          rtnPayee.payeeName = payeeFromDB.payeeName;
          rtnPayee.accountGroup = payeeFromDB.accountGroup;
          rtnPayee.links = {};
      }
      return rtnPayee;
  }

  const constructPayeeList = function(payeeListFromDB) {
      let rtnPayeeList = [];
      if (payeeListFromDB && payeeListFromDB.length > 0) {
          payeeListFromDB.forEach(function(val, idx, arr) {
              rtnPayeeList.push(constructPayeeObjectForRead(val));
          })
      }
      return rtnPayeeList;
  }

  const constructPayeeObjectForSave = function(payeeFromApp) {
      let newPayee = new payee;
      if (payeeFromApp) {
          newPayee.payeeName = payeeFromApp.payeeName;
          newPayee.accountGroup = payeeFromApp.accountGroup;
      }
      return newPayee;
  }

  const constructPayeeObjectForUpdate = function(payeeObject, payeeFromApp) {
      if (payeeFromApp) {
          if (payeeFromApp.payeeName) payeeObject.payeeName = payeeFromApp.payeeName;
          if (payeeFromApp.accountGroup) payeeObject.accountGroup = payeeFromApp.accountGroup;
      }
      return payeeObject;
  }


  return {
    findPayee: findPayee,
    updatePayee: updatePayee,
    createPayee: createPayee,
    deletePayee: deletePayee,
    findAllPayees: findAllPayees
  }
}

module.exports = controller;
