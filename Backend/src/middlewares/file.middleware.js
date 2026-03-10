const multer = require("multer");

const upload = multer({
    storage:multer.memoryStorage(),
    limits:{
        fileSize:7*1024*1024 //7 MB
    }
})

module.exports = upload