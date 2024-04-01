
const verifyUploadFile = (req, res, next) => {
    if(!req.file) {
        return res.status(401).send({
            message : "File not selected"
        })
    }
    if(!req.body.subject_code || req.body.subject_code.length > 10) {
        return res.status(401).send({
            message : "Invalid Subject Code"
        })
    }
    if(!req.body.subject_name || req.body.subject_name.length > 50) {
        return res.status(401).send({
            message : "Invalid Subject Name"
        })
    }
    if(!req.body.description || req.body.description.length > 100) {
        return res.status(401).send({
            message : "Invalid Description"
        })
    }
    else
        next()
}

module.exports = {
    verifyUploadFile
}