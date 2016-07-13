const mongoose = require('mongoose');
const schema = mongoose.Schema;

const UserSchema = schema({
    _id: {
        type: schema.Types.ObjectId,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    biography: {
        type: String,
        required: false
    },
    joinDate: {
        type: Date,
        required: false
    },
    google: {
        type: Object,
        required: false
    },
    groups: [{
        type: String,
        required: false
    }]
});

//parameters are: schema-name, schema-object, mongo-collection-name
module.exports = mongoose.model('user', UserSchema, 'user');
