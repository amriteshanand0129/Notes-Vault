const mongoose = require("mongoose")

const rejected_contributionSchema = mongoose.Schema({
    contributerId : {
        type : Object,
        required : true
    },
    uploadedOn : {
        type : Date,
        required : true
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
        unique : true,
        trim : true,
        maxlength : 50
    },
    description : {
        type : String,
        required : true,
        trim : true,
        maxlength : 100
    },
    remarks : {
        type : String,
        required : true,
        maxlength : 200
    }
}, {versionKey : false})

module.exports = mongoose.model("Rejected Contributions", rejected_contributionSchema)