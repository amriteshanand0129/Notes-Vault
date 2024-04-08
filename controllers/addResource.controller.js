const resource_model = require("../models/resources.model")
const pending_resource_model = require("../models/pending_resource.model")
const approved_contributions_model = require("../models/approved_contributions")
const path = require("path")
const file = require("fs")

const addResource = async (req, res) => {
    const filepath = req.file.path
    const user = req.user
    if(user.userType == "ADMIN") {
        try {
            const pdfbuffer = file.readFileSync(filepath)
            const created = await resource_model.create({
                subject_code : req.body.subject_code,
                subject_name : req.body.subject_name,
                file_name : req.body.file_name,
                description : req.body.description,
                filebuffer : pdfbuffer
            })
            console.log("File added to database", created)
            res.status(201).send({
                message : "File Added Successfully",
            })
        }catch(err) {
            console.log("Error adding resource", err)
            res.status(401).send({
                error : "Error adding resource"
            })
        }finally {
            file.unlink(filepath, function (err) {
                if(err)
                    console.log("Error deleting file", err)
                else
                    console.log("File deleted succesfully")
            })
        }
    }
    else if(user.userType == "CUSTOMER") {
        try {
            const pdfbuffer = file.readFileSync(filepath)
            const created = await pending_resource_model.create({
                contributedBy : req.user.name,
                contributerId : req.user._id,
                subject_code : req.body.subject_code,
                subject_name : req.body.subject_name,
                file_name : req.body.file_name,
                description : req.body.description,
                filebuffer : pdfbuffer
            })
            console.log("File added to database", created)
            res.status(201).send({
                message : "File Uploaded Successfully",
            })
        }catch(err) {
            console.log("Error while adding contribution", err)
            res.status(401).send({
                error : "Error while adding contribution"
            })
        }finally {
            file.unlink(filepath, function (err) {
                if(err)
                    console.log("Error deleting file", err)
                else
                    console.log("File deleted succesfully")
            })
        }
    }
}

const addContribution = async (req, res) => {
    const user = req.user
    try {
        const file = await pending_resource_model.findOne({_id : req.body._id})
        const created = await resource_model.create({
            contributerId : file.contributerId,
            subject_code : req.body.subject_code,
            subject_name : req.body.subject_name,
            file_name : req.body.file_name,
            description : req.body.description,
            filebuffer : file.filebuffer
        })
        try {
            const result = await approved_contributions_model.create({
                contributerId : created.contributerId,
                contributionId : created._id 
            })
        }catch(err) {
            console.log("Error while updating Approved Contributions list")
        }
        const result = await pending_resource_model.deleteOne({_id : req.body._id})
        if(result.deletedCount == 1) {
            console.log("Pending Contribution List Updated")
        }
        else {
            console.log("Failed to update Pending Contribution List")
        }
        console.log("File added to database", created)
        res.status(201).send({
            message : "File Added Successfully",
        })
    }catch(err) {
        console.log("Error adding resource", err)
        res.status(401).send({
            error : "Error adding contribution resource"
        })
    }
}

const deleteContribution = async (req, res) => {
    const user = req.user
}
module.exports = {
    addResource : addResource,
    addContribution : addContribution,
    deleteContribution : deleteContribution
}