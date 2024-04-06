const resource_model = require("../models/resources.model")
const pending_resource_model = require("../models/pending_resource.model")
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
            res.status(401).send("Error uploading file")
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
            console.log("Error creating resource", err)
            res.status(401).send("Error uploading file")
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
            contributerId : req.body.contributerId,
            subject_code : req.body.subject_code,
            subject_name : req.body.subject_name,
            file_name : req.body.file_name,
            description : req.body.description,
            filebuffer : file.filebuffer
        })
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
        res.status(401).send("Error uploading file")
    }
}
module.exports = {
    addResource : addResource,
    addContribution : addContribution
}