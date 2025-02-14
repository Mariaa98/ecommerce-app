var mongoose = require('mongoose');

var userSchema = mongoose.Schema({

    name: {
        type: String , 
        required: true,

    },
    email: {
        type: String ,
        required: true
    },
    userName: {
        type: String , 
        required: true,

    },
    password: {
        type: String,
        required: true, 

    },
    admin: {
        type: Number
    }
});

var User = module.exports = mongoose.model('User',userSchema);