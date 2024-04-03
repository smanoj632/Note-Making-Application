const mongoose = require('mongoose');
const {Schema} = mongoose;
const userSchema = new Schema({
    name : {
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true,
        unique : true
    },
    timestamp : {
        type : Date,
        default : Date.now
    }
});
const userModel = mongoose.model('user',userSchema);
module.exports = userModel;