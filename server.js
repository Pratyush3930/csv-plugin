// server.js

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const convertXlsMiddleware = require("./server/middleware/xlsToCSV");
const fileRoute = require("./server/routes/fileRoute");

// middleware to parse JSON in request bodies
app.use(bodyParser.json());

// Enalbe CORS for all routes
app.use(
  cors({
    // adjust the origin to match react app url
    origin: "http://localhost:3000",
    credentials: true,
  })
);

console.log("Current directory:", __dirname);

app.use("/api/uploadFile", fileRoute);

const upload2 = multer({
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
// above the upload destination in disk has not been specified
// the below function is used to perfom operations on the provided file
// so no destination required
app.use("/api/uploadFile", upload2.single("file"), convertXlsMiddleware);
// NOTE:  we do not specify destination if we want to use buffer property
// in a function using multer

// Middleware to handle common headers
app.use((req, res, next) => {
  // Set common response headers
  res.header("Content-Type", "application/json");

  // Allow credentials (cookies, HTTP authentication)
  res.header("Access-Control-Allow-Credentials", "true");

  // Proceed to the next middleware
  next();
});

app.get("/api/data", (req, res) => {
  res.json({ message: "Hello from the Express backend!" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
