const mongoose = require("mongoose")

const approved_contributionsSchema = mongoose.Schema({
    contributerId : {
        type : Object,
        required : true
    },
    contributionId : {
        type : Object,
        required : true
    },
    status : {
        type : Boolean,
        required : true
    },
    details : {
        type : Object
    }
}, {timestamp: true, versionKey : false})

module.exports = mongoose.model("Approved Contributions", approved_contributionsSchema)