const mongoose = require('mongoose');
const schema = mongoose.Schema;

const AccountGroupSchema = schema({
    groupName: {
        type: String
    },
    description: {
        type: String
    },
    owner: {
        type: Schema.Types.ObjectId
    },
    members: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

//parameters are: schema-name, schema-object, mongo-collection-name
module.exports = mongoose.model('AccountGroup', UserSchema, 'accountgroup');
