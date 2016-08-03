const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountGroupSchema = Schema({
    groupCode: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'user'
    },
    members: [{
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'user'
    }],
    password: {
        type: String,
        required: true
    },
    createdDate: {
        type: Date,
        default: Date.now,
        required: true
    }
});

//parameters are: schema-name, schema-object, mongo-collection-name
module.exports = mongoose.model('accountgroup', AccountGroupSchema, 'accountgroup');
