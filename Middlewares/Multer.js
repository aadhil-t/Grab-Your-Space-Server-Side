const multer = require("multer")

const storage = multer.diskStorage({});

const uploadOption = multer({storage});

module.exports = { uploadOption };