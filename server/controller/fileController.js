const { error } = require("console");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, callBack) => {
    callBack(null, "server/uploads");
  },
  filename: function (req, file, cb) {
    var datetimestamp = Date.now();
    cb(
      null,
      file.fieldname +
        "-" +
        datetimestamp +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    );
  },
});

const upload = multer({
  //multer settings
  storage: storage,
  fileFilter: function (req, file, callback) {
    var ext = path.extname(file.originalname);
    if (ext !== ".xls" && ext !== ".tsv" && ext !== ".csv" && ext !== ".xlsx") {
      return callback(new Error("Only Excel and tsv files are allowed"));
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024,
  },
});
// const upload = multer({ storage: storage });
// let upload = multer({ dest: './server/uploads/' })

const uploadFile = (req, res, next) => {
  const file = req.file;
  console.log(file.filename);
  if (!file || !file.filename) {
    const error = new Error("No File");
    error.httpStatusCode = 400;
    return next(error);
  }
  res.send('hello');
};

module.exports = { uploadFile, upload };
