import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// utilityFunctions.js
export const fileExports = (exportType , rowData) => {
    if(exportType === 'JSON'){
        exportToJson(rowData);
    }
    if(exportType === 'Excel'){
        exportToExcel(rowData);
    }
};

const exportToJson = (rowData) => {
    const jsonData = rowData;
    const jsonString = JSON.stringify(jsonData, null, 2);

    // Create a Blob from the JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, "exportedData.json");
  };

  const exportToExcel = (rowData) => {
    const worksheet = XLSX.utils.json_to_sheet(rowData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Buffer to store the generated Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

    saveAs(blob, "exportedData.xlsx");
};

