const {Router} = require('express');
const fileController = require('../controller/fileController')
const {upload} = require('../controller/fileController')
const router = Router();

router.post("/", upload.single("file"), fileController.uploadFile)

module.exports = router;