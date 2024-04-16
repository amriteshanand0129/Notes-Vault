const mongoose = require("mongoose")

const pending_resourcesSchema = mongoose.Schema({
    contributedBy : {
        type : String,
        required : true,
        trim : true,
        maxlength : 30
    },
    contributerId : {
        type : Object,
        required : true,
        trim : true,
    },
    subject_code : {
        type : String,
        required : true,
        trim : true,
        maxlength : 10,
    },
    subject_name : {
        type : String,
        required : true,
        trim : true,
        maxlength : 50
    },
    file_name : {
        type : String,
        required : true,
        trim : true,
        maxlength : 50
    },
    description : {
        type : String,
        required : true,
        trim : true,
        maxlength : 100
    },
    filebuffer : {
        type : Buffer,
        required : true
    }
}, {timestamps : true, versionKey : false})

module.exports = mongoose.model("Pending Resources", pending_resourcesSchema)