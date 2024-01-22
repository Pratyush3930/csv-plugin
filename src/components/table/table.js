import React, { useCallback, useRef, useState } from "react";
import "./table.css";
import { AgGridReact } from "ag-grid-react"; // React Grid Logic
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme
import Validate from "../../utils/gridValidation/Validate";
import { fileExports } from "../../utils/fileExport/fileExport";
import { CSVLink } from "react-csv";

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
  setColumnDataTypesChanged,
  setRowData,
  handleCellClicked,
  handleDeleteSelectedColumn,
}) => {
  const [renderQuestion, setRenderQuestion] = useState(true);
  const [fileExport, setFileExport] = useState("CSV");
  const [selectedRows, setSelectedRows] = useState([]);
  const [inputRow, setInputRow] = useState({});
  const gridRef = useRef();
  // default values to be used in all columns of AgGrid
  const defaultColDef = React.useMemo(
    //to memoize the result of a computation i.e. to avoid repeating the computation unnecessarily
    () => ({
      editable: true, //enable editing of the cells
      resizable: true,
      flex: 1,
      sortable: true,
      filter: true, // Enable filtering on all columns
      minWidth: 100,
      valueGetter: (params) => {
        const isTopRow = params.node.rowPinned === "top";
        const isEditingTopRow = isTopRow && params.data === inputRow;

        if (
          isEditingTopRow &&
          params.node.data[params.colDef.field] !== undefined
        ) {
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
      console.log("fileexport", fileExport);
      fileExports(fileExport, rowData);
      setSubmitted(false);
    } catch (error) {
      console.log(error);
    }
  };

  // Extract column headers from the first object in rowdata
  const columns = Object?.keys(rowData[0]);
  console.log('rowdata is',rowData);
  console.log('column is', columns);
  console.log('column data is', colDefs);
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

  const getRowStyle = useCallback(
    ({ node }) =>
      node.rowPinned ? { fontWeight: "bold", fontStyle: "italic" } : {},
    []
  );
  const isPinnedRowDataCompleted = useCallback(
    (params) => {
      if (params.rowPinned !== "top") return;
      return colDefs.every((def) => inputRow[def.field]);
    },
    [colDefs, inputRow]
  );

  const onCellEditingStopped = useCallback(
    (params) => {
      if (isPinnedRowDataCompleted(params)) {
        setRowData([...rowData, inputRow]);
        setInputRow({});
      }
    },
    [rowData, inputRow, setRowData, isPinnedRowDataCompleted]
  );

  function isEmptyPinnedCell(params) {
    return (
      (params.node.rowPinned === "top" && params.value == null) ||
      (params.node.rowPinned === "top" && params.value === "")
    );
  }

  function createPinnedCellPlaceholder({ colDef }) {
    return colDef.field[0].toUpperCase() + colDef.field.slice(1) + "...";
  }

  const onGridReady = (params) => {
    const gridApi = params.api;

    // Add an event listener for row selection changes
    gridApi.addEventListener("rowSelected", onRowSelected);
  };

  const onRowSelected = useCallback((event) => {
    // Check if the row is selected
    if (event.node.isSelected()) {
      // Add the row data to the selectedRows state
      setSelectedRows((prevSelectedRows) => [...prevSelectedRows, event.data]);
    } else {
      // Remove the row data from the selectedRows state
      setSelectedRows((prevSelectedRows) =>
        prevSelectedRows.filter((row) => row !== event.data)
      );
    }
  }, []);

  const handleDeleteRows = () => {
    // Filter the original rowData array to exclude selected rows
    const updatedRowData = rowData.filter((row) => !selectedRows.includes(row));

    // Update the rowData state with the new data
    setRowData(updatedRowData);

    // Clear the selectedRows state
    setSelectedRows([]);
  };

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
                <button
                  className="btn black-btn"
                  onClick={() => {
                    handleDeleteRows();
                  }}
                >
                  Delete selected row
                </button>
                <button
                  onClick={handleDeleteSelectedColumn}
                  className="btn black-btn"
                >
                  Delete Selected Column
                </button>
                <div className="btn black-btn">
                  {fileExport === "CSV" ? (
                    <CSVLink
                      data={rowData}
                      filename={"exportedData.csv"}
                      target="_blank"
                      className="mr-2"
                    >
                      Export to
                    </CSVLink>
                  ) : (
                    <button onClick={() => onBtExport()} className="mr-2">
                      Export to
                    </button>
                  )}
                  <select
                    className="border border-black rounded-sm"
                    onChange={(e) => {
                      setFileExport(e.target.value);
                    }}
                  >
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
                    onGridReady={onGridReady}
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
                    onCellClicked={handleCellClicked}
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
