const mongoose = require("mongoose")

const approved_contributionsSchema = mongoose.Schema({
    contributerId : {
        type : Object,
        required : true
    },
    contributionId : {
        type : Object,
        required : true
    }
}, {versionKey : false})

module.exports = mongoose.model("Approved Contributions", approved_contributionsSchema)