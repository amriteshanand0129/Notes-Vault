const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        trim : true,
        maxlength : 30,
    },
    userId : {
        type : String,
        required : true,
        trim : true,
        maxlength : 30,
        unique : true,
        immutable : true,
        index : true
    },
    password : {
        type : String,
        required : true,
        trim : true,
    },
    userType : {
        type : String,
        immutable : true,
        default : "CUSTOMER",
        enum : ["CUSTOMER", "ADMIN"]
    }
}, {timestamps : true, versionKey : false})

module.exports = mongoose.model("User", userSchema)