// tomorrow use valuesetter and valuegetter logic to change the values in ur table accordingly and to verify the data

import React, {  useRef, useState } from "react";
import "./table.css";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ExcelExportModule } from "@ag-grid-enterprise/excel-export";
import { AgGridReact } from "ag-grid-react"; // React Grid Logic
// import { useGridApi } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import Validate from "../../utils/gridValidation/Validate";
// Register the ExcelExportModule
ModuleRegistry.registerModules([ExcelExportModule]);

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
  setColumnDataTypesChanged
}) => {
  const [renderQuestion, setRenderQuestion] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  // const [editHeader, setEditHeader] = useState(false);
  // to validate the data cells
  const gridRef = useRef();
  // default values to be used in all columns of AgGrid
  const defaultColDef = React.useMemo(
    () => ({
      editable: true, //enable editing of the cells
      resizable: true,
      flex: 1,
      sortable: true,
      filter: true, // Enable filtering on all columns
      minWidth: 100,
    }),
    []
  );

  const onBtExport = () => {
    try {
      gridRef.current.api.exportDataAsCsv();
      setSubmitted(false);
    } catch (error) {
      console.log(error);
    }
  };

  // Extract column headers from the first object in rowdata
  const columns = Object?.keys(rowData[0]);
  let newColKey = 0;
  // new column key

  // Check if theres any data

  const handleRejectHeader = () => {
    setRenderQuestion(false);
    setIsHeader(false);
  };

  const undoRedoCellEditing = true;

  // restricts the number of undo / redo steps to 5
  const undoRedoCellEditingLimit = 10;

  // enables flashing to help see cell changes
  const enableCellChangeFlash = true;

  // const arrayOfValues = colDefs.map((obj) => obj.field);

  

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
                <button onClick={() => onBtExport()} className="btn blue-btn ">
                  Export to CSV
                </button>
                <button
                  className="btn font-bold border border-black"
                  onClick={() => {
                    handleRejectHeader();
                    const columnApi = gridRef.current.api;
                    const allColumns = columnApi.getColumns();
                    allColumns.forEach((column) => {
                      console.log("Column ID:", column.getColId());
                      console.log(
                        "Column Header:",
                        column.getColDef().headerName
                      );
                      console.log("Column Field:", column.getColDef().field);
                      // Add more column-related information as needed
                    });
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
                  <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    rowSelection="multiple"
                    animateRows={true}
                    enableCellChangeFlash={enableCellChangeFlash}
                    undoRedoCellEditing={undoRedoCellEditing}
                    undoRedoCellEditingLimit={undoRedoCellEditingLimit}
                    // onGridReady={handleGridReady}
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
