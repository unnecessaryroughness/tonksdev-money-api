const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = Schema({
    accountCode: {
        type: String,
        required: true
    },
    accountName: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        required: false,
        default: 'CA'
    },
    bankName: {
        type: String,
        required: true
    },
    accountGroup: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'accountgroup'
    },
    balance: {
        type: Number,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now,
        required: false
    }
});

//parameters are: schema-name, schema-object, mongo-collection-name
module.exports = mongoose.model('account', AccountSchema, 'account');
