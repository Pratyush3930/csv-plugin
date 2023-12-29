var XLSX = require("xlsx");

const convertXlsMiddleware =  (req, res ,next) => {
    try {
    const file = req.file;
    const result =  file.buffer;
    // Buffers are just array of bytes (printed in hexadeciamal here 00 to ff, or 0 to 255.
    // uint8array converts the given buffer to unsigned 8 bit integer array 
    // it is required to perform operations to the file
    const data = new Uint8Array(result);
    const workbook = XLSX.read(data, {type: "array"});
    let first_sheet_name = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[first_sheet_name];
    let jsonData = XLSX.utils.sheet_to_json(worksheet, {raw:true});
    // let csvData = XLSX.utils.sheet_to_csv(worksheet);
    req.jsonData = jsonData;
    // console.log('csv',csvData);
    next();
    } catch (error) {
        console.log('Error::::',error)
    }
}

module.exports = convertXlsMiddleware