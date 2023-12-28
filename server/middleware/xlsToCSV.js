var XLSX = require("xlsx");

const convertXlsMiddleware = async (req, res ,next) => {
    try {
        console.log(req.file);
    const file = req.file;
    const result = await file.buffer;
    // Buffers are just array of bytes (printed in hexadeciamal here 00 to ff, or 0 to 255.
    console.log('result', file.buffer)
    // uint8array converts the given buffer to unsigned 8 bit integer array 
    // it is required to perform operations to the file
    const data = new Uint8Array(result);
    console.log('data:', data);
    const workbook = XLSX.read(data, {type: "array"});
    console.log('workbook',workbook)
    let first_sheet_name = workbook.SheetNames[0];
    console.log("Sheet Name",first_sheet_name);
    const worksheet = workbook.Sheets[first_sheet_name];
    let jsonData = XLSX.utils.sheet_to_json(worksheet, {raw:true});
    console.log('jsonData:',jsonData);
    let csvData = XLSX.utils.sheet_to_csv(worksheet);
    req.jsonData = jsonData;
    console.log('csv',csvData);
    next();
    } catch (error) {
        console.log('Error::::',error)
    }

}

module.exports = convertXlsMiddleware