const mongoose = require('mongoose');
const schema = mongoose.Schema;

const UserSchema = schema({
    _id: {
        type: schema.Types.ObjectId
    },
    displayName: {
        type: String
    },
    image: {
        type: String
    },
    email: {
        type: String
    },
    biography: {
        type: String
    },
    joinDate: {
        type: Date
    },
    google: {
        type: Object
    }
});

//parameters are: schema-name, schema-object, mongo-collection-name
module.exports = mongoose.model('user', UserSchema, 'user');
