const mongoose = require("mongoose")

const resourcesSchema = mongoose.Schema({
    contributerId : {
        type : Object,
        trim : true,
    },
    subject_code : {
        type : String,
        required : true,
        trim : true,
        maxlength : 10,
        index : true
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

module.exports = mongoose.model("Resources", resourcesSchema)