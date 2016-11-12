const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PayeeSchema = Schema({
    payeeName: {
        type: String,
        required: true
    },
    accountGroup: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'accountgroup'
    },
    createdDate: {
        type: Date,
        default: Date.now,
        required: false
    }
});

//parameters are: schema-name, schema-object, mongo-collection-name
module.exports = mongoose.model('payee', PayeeSchema, 'payee');
