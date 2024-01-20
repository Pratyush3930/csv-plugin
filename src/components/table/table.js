// tomorrow use valuesetter and valuegetter logic to change the values in ur table accordingly and to verify the data

import React, { useCallback, useRef, useState } from "react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import "./table.css";
import { AgGridReact } from "ag-grid-react"; // React Grid Logic
// import { useGridApi } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import Validate from "../../utils/gridValidation/Validate";

const Table = ({
  setIsHeader,
  isHeader,
  rowData,
  colDefs,
  setColDefs,
  handleNewColumnDefn,
  isLoading,
  setSubmitted,
  columnDataTypes,
  setColumnDataTypes,
  columnDataTypesChanged,
  setColumnDataTypesChanged,
  setRowData
}) => {
  const [renderQuestion, setRenderQuestion] = useState(true);
  // const [fileExport, setFileExport] = useState('');
  const [inputRow, setInputRow] = useState({});
  const [reloadKey, setReloadKey] = useState(0);
  const gridRef = useRef();
  // default values to be used in all columns of AgGrid
  const defaultColDef = React.useMemo(  //to memoize the result of a computation i.e. to avoid repeating the computation unnecessarily
    () => ({
      editable: true, //enable editing of the cells
      resizable: true,
      flex: 1,
      sortable: true,
      filter: true, // Enable filtering on all columns
      minWidth: 100,
      valueGetter: (params) => {
  const isTopRow = params.node.rowPinned === 'top';
  const isEditingTopRow = isTopRow && params.data === inputRow;
  
  if (isEditingTopRow && params.node.data[params.colDef.field] !== undefined) {
    // If the current cell is in the editing top row, display the edited value
    return params.node.data[params.colDef.field];
  } else if (isTopRow && isEmptyPinnedCell(params)) {
    // If it's the top row and the cell is empty, display the placeholder
    return createPinnedCellPlaceholder(params);
  } else {
    // Otherwise, display the original value
    return params.data[params.colDef.field];
  }
},
      valueSetter: (params) => {
        params.data[params.colDef.field] = params.newValue;
        return true; // Allow editing for all rows, including pinned rows
      },
    }),
    [inputRow]
  );

  const onBtExport = () => {
    try {
      // Get the grid API
      const gridApi = gridRef.current.api;
  
      // Clone the original rowData
      const rowDataCopy = [...rowData];
      console.log('rowdata before shifting:',rowDataCopy)
  
      // Remove the top-pinned row from the cloned rowData
      // rowDataCopy.shift(); // Remove the first row (top-pinned row)

        // Params for export
      const params = {
        skipHeader: false,
        columnGroups: false,
        skipFooters: true,
        allColumns: true,
        onlySelected: false,
        suppressQuotes: true,
        fileName: "exportedData.csv",
        sheetName: "Sheet1",
      };
  
      // Export the modified data (excluding the top-pinned row)
      // gridApi.exportDataAsCsv(params);
  
      setSubmitted(false);
    } catch (error) {
      console.log(error);
    }
  };

  // Extract column headers from the first object in rowdata
  const columns = Object?.keys(rowData[0]);
  let newColKey = 0;
  // new column key

  const handleRejectHeader = () => {
    setRenderQuestion(false);
    setIsHeader(false);
  };

  const undoRedoCellEditing = true;

  // restricts the number of undo / redo steps to 5
  const undoRedoCellEditingLimit = 10;

  // enables flashing to help see cell changes
  const enableCellChangeFlash = true;


//   const exportToExcel = () => {
//     const worksheet = XLSX.utils.json_to_sheet(rowData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

//     // Buffer to store the generated Excel file
//     const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//     const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

//     saveAs(blob, "exportedData.xlsx");
// };

const getRowStyle = useCallback(
  ({ node }) =>
    node.rowPinned ? { fontWeight: 'bold', fontStyle: 'italic' } : {},
  []
);
const isPinnedRowDataCompleted = useCallback((params) => {
    if (params.rowPinned !== 'top') return;
    return colDefs.every((def) => inputRow[def.field]);
  }, [colDefs, inputRow]);

const onCellEditingStopped = useCallback(
  (params) => {
    if (isPinnedRowDataCompleted(params)) {
      setRowData([...rowData, inputRow]);
      setInputRow({});
    }
  },
  [rowData, inputRow, setRowData, isPinnedRowDataCompleted]
);

// const exportToJson = () => {
//   const jsonData = gridRef.current.api.getDataAsJson();
//   const jsonString = JSON.stringify(jsonData, null, 2);

//   // Create a Blob from the JSON string
//   const blob = new Blob([jsonString], { type: 'application/json' });
//   saveAs(blob, "exportedData.json");
// };

function isEmptyPinnedCell(params) {
  return (
    (params.node.rowPinned === 'top' && params.value == null) ||
    (params.node.rowPinned === 'top' && params.value === '')
  );
}

function createPinnedCellPlaceholder({ colDef }) {
  return colDef.field[0].toUpperCase() + colDef.field.slice(1) + '...';
}

  return (
    <>
      {isLoading &&
      (!rowData.length || !colDefs.length || !rowData || !colDefs) ? (
        <div>
          <p className="font-sans font-semibold text-xl mt-16">Loading...</p>
        </div>
      ) : (
        <div className="table-section">
          {renderQuestion && (
            <div className="mb-4">
              <p>Does the top column contain your table headings?</p>
              <div className="mt-4">
                <button
                  className="btn  bg-darkBlue text-white my-4"
                  onClick={() => {
                    setRenderQuestion(false);
                  }}
                >
                  Yes
                </button>
                <button
                  className="btn text-slate-900 border border-black"
                  onClick={() => {
                    handleRejectHeader();
                  }}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {/* {console.log(colDefs)}
          {console.log("values", arrayOfValues)}
          {console.log("row data is:", rowData)} */}
          {!renderQuestion && !isHeader && (
            <div className="w-full flex flex-col items-center">
              <h3 className="mb-3">
                Enter your table headers in the correct order:
              </h3>
              <form
                action=""
                onSubmit={(e) => {
                  handleNewColumnDefn(e);
                }}
                className="w-full flex flex-col items-center"
              >
                <table className="w-11/12 mx-4 rounded-sm ">
                  <tbody>
                    <tr>
                      {columns.map(() => (
                        <th
                          key={newColKey++}
                          className="border-blue-950 border-2 shrink"
                        >
                          <input
                            // type={typeof rowdata[0][columns[newColKey]]}
                            type="string"
                            // since the name and id cannot start with a number so added val in front of it
                            name={"val" + newColKey}
                            id={"val" + newColKey}
                            className="w-full max-w-24 min-w-12 border-none outline-none"
                          />
                        </th>
                      ))}
                    </tr>
                  </tbody>
                </table>
                <button className="btn blue-btn my-7">Submit</button>
              </form>
            </div>
          )}
          <>
            {!renderQuestion && isHeader && (
              <div className="flex gap-4 items-center justify-center mb-5">
                <div className="btn black-btn ">
                  <button
                    onClick={() => onBtExport()}
                    className="mr-2"
                  >
                    Export to
                  </button>
                  <select className="border border-black rounded-sm">
                    <option value="CSV">CSV</option>
                    <option value="JSON">JSON</option>
                    <option value="Excel">Excel</option>
                  </select>
                </div>
                <button
                  className="btn font-bold border border-black"
                  onClick={() => {
                    handleRejectHeader();
                  }}
                >
                  Edit Headers
                </button>
                {/* to validate the 
                 data in each column cell */}
                <Validate
                  columns={columns}
                  columnDataTypes={columnDataTypes}
                  setColumnDataTypes={setColumnDataTypes}
                  setColumnDataTypesChanged={setColumnDataTypesChanged}
                  // onGridReady={handleGridReady}
                  setReloadKey={setReloadKey}
                />
              </div>
            )}
            <div className="flex justify-center items-center w-full h-full ml-4">
              <div className="table h-96 w-full ">
                <div
                  className="ag-theme-quartz-dark"
                  id="myGrid"
                  style={{ height: 400, minWidth: 500 }}
                >
                  {/* The AG Grid component */}
                  {console.log(rowData)}
                  <AgGridReact
                    key={reloadKey}
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    rowSelection="multiple"
                    animateRows={true}
                    enableCellChangeFlash={enableCellChangeFlash}
                    undoRedoCellEditing={undoRedoCellEditing}
                    undoRedoCellEditingLimit={undoRedoCellEditingLimit}
                    onCellEditingStopped={onCellEditingStopped}
                    pinnedTopRowData={[inputRow]}
                    getRowStyle={getRowStyle}
                  />
                </div>
              </div>
            </div>
          </>
        </div>
      )}
    </>
  );
};

export default Table;
