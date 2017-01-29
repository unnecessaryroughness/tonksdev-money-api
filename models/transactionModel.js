const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = Schema({
    account: {
      code: {
        type: String,
        required: true
      },
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'account'
      },
      name: {
        type: String,
        required: false
      },
      previous: {
        code: {
          type: String,
          required: false
        },
        id: {
          type: Schema.Types.ObjectId,
          required: false,
          ref: 'account'
        }
      },
      group: {
        code: {
          type: String,
          required: true
        },
        id: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'accountgroup'
        }
      }
    },
    payee: {
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'payee'
      },
      name: {
        type: String,
        required: true
      },
      transferAccount: {
        code: {
          type: String,
          required: false
        },
        id: {
          type: Schema.Types.ObjectId,
          required: false,
          ref: 'account'
        }
      }
    },
    category: {
      id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'category'
      },
      name: {
        type: String,
        required: true
      }
    },
    amount: {
      type: Number,
      required: true
    },
    transactionDate: {
      type: Date,
      required: true
    },
    createdDate: {
      type: Date,
      default: Date.now,
      required: false
    },
    notes: {
      type: String,
      required: false
    },
    isCleared: {
      type: Boolean,
      default: false,
      required: false
    },
    isPlaceholder: {
      type: Boolean,
      default: false,
      required: false
    },
    balance: {
      type: Number,
      required: false,
      default: 0
    },
    repeating: {
      nextDate: {
        type: Date,
        required: false
      },
      prevDate: {
        type: Date,
        required: false
      },
      endOnDate: {
        type: Date,
        required: false
      },
      frequency: {
        code: {
          type: String,
          required: false,
          default: "M"
        },
        increment: {
          type: Number,
          required: false,
          default: 1
        }
      }
    }
});

//parameters are: schema-name, schema-object, mongo-collection-name
module.exports = mongoose.model('transaction', TransactionSchema, 'transaction');
