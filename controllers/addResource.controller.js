const resource_model = require("../models/resources.model")
const path = require("path")
const file = require("fs")

module.exports = async (req, res) => {
    const filepath = req.file.path
    try {
        const pdfbuffer = file.readFileSync(filepath)
        const created = await resource_model.create({
            subject_code : req.body.subject_code,
            subject_name : req.body.subject_name,
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