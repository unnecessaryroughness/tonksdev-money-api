var mongoose = require('mongoose');
var schema = mongoose.Schema;

var UserSchema = schema({
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
    facebook: {
        type: Object
    },
    twitter: {
        type: Object
    },
    google: {
        type: Object
    }
});

//parameters are: schema-name, schema-object, mongo-collection-name
module.exports = mongoose.model('User', UserSchema, 'user');
