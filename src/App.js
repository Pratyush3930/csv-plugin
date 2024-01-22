import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import "./App.css";
import axios from "axios";
import Table from "./components/table/table";
import myContext from "./utils/context/myContext";

function App() {
  const [isHeader, setIsHeader] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jsonData, setJsonData] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);
  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [columnDataTypesChanged, setColumnDataTypesChanged] = useState(false);
  const [columnDataTypes, setColumnDataTypes] = useState({});
  const [runCustomRenderer, setRunCustomRenderer] = useState(false);
  const [clickedCell, setClickedCell] = useState(null);

  const apiUrl = "http://localhost:5000/api";

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const customCellRenderer = React.useCallback(
    (params) => {
      if (!runCustomRenderer || params.node.rowPinned === "top") {
        return params.value;
      }
      const value = params.value;
      const columnName = params.colDef.field;

      // Move validation inside the useCallback callback
      const validation = (tableValue, currentColumnName) => {
        if (columnDataTypesChanged) {
          // Iterate over columns and their data types
          for (const [column, dataType] of Object.entries(columnDataTypes)) {
            // Check if the current column matches the intended column
            if (column === currentColumnName) {
              // Iterate over rows
              for (const row of rowData) {
                // Check if the current cell matches the specified value
                if (row[column] === tableValue) {
                  const isValidEmail = (email) => {
                    // Email validation logic
                    // You can use a regular expression or any other method
                    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return re.test(String(email).toLowerCase());
                  };
                  switch (dataType) {
                    case "string":
                      if (
                        typeof row[column] !== "string" ||
                        !isNaN(Number(row[column]))
                      ) {
                        return false;
                      }
                      break;
                    case "number":
                      if (isNaN(Number(row[column]))) {
                        return false;
                      }
                      break;
                    case "email":
                      if (!isValidEmail(row[column])) {
                        return false;
                      }
                      break;
                    // Add cases for other data types if needed
                    case "None":
                      // No validation needed for "None"
                      break;
                    default:
                      // No validation for other types
                      break;
                  }
                }
              }
            }
          }
        }
        // All validations passed
        return true;
      };

      // Call the validation function and get the result
      const valid = validation(value, columnName);

      // Conditionally apply styles based on the validation result
      const cellStyle = !valid ? (
        <FontAwesomeIcon icon={faX} style={{ color: "red" }} />
      ) : (
        <FontAwesomeIcon icon={faCheck} style={{ color: "green" }} />
      );

      return (
        <div className="flex gap-1 justify-start items-center">
          {cellStyle}
          {value}
        </div>
      );
    },
    [columnDataTypesChanged, columnDataTypes, rowData, runCustomRenderer]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRunCustomRenderer(false);
    // creates a empty formData object
    const data = new FormData();
    // append adds a key value pair key='file' value=e.target.f[0]
    data.append("file", selectedFile);
    try {
      await axios.post(`${apiUrl}/convertFile`, data).then((res) => {
        setJsonData(res.data);
        setRowData(res.data);
        setKeys(Object.keys(res.data[0]));
        const findKey = Object.keys(res.data[0]).map((eachKey) => ({
          field: eachKey,
          headerName: eachKey,
          cellRenderer: customCellRenderer,
        }));
        // setTimeout(() => {
        setColDefs(findKey);
        setIsLoading(false);
        // }, 2000);
        setSubmitted(true);
        forceRerender();
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleNewColumnDefn = (e) => {
    e.preventDefault();
    setRunCustomRenderer(false);
    try {
      let colLength = colDefs.length;
      let i = 0;
      let newColumns = [];
      let newKeys = [];
      while (i < colLength) {
        // to access value dynamically below syntax
        let newCol = e.target[`val${i}`]?.value;
        newCol = newCol ? newCol : keys[i];
        // created an array of keys in newKeys using each value of newCol
        newKeys.push(newCol);
        const column = { field: newCol };
        // pushing each column value to newColumns and creating a array of objects
        newColumns.push(column);
        i++;
      }
      setColDefs(newColumns);
      // below is mapping of oldKeys to newKeys
      const newKeyMapping = Object.keys(jsonData[0]).reduce(
        (result, oldKey, index) => {
          result[oldKey] = newKeys[index] || null;
          console.log(
            "result:",
            result,
            "oldkey:",
            oldKey,
            "newkeys",
            newKeys,
            "index",
            index,
            "newkeys[index]",
            newKeys[index]
          );
          return result;
        },
        {} //it is the initial value of the accumulator that is result in this case
      );
      setKeys(newKeys);
      const updatedData = jsonData.map((eachData) => {
        const updatedObject = {};
        Object.keys(eachData).forEach((oldKey) => {
          const newKey = newKeyMapping[oldKey];
          updatedObject[newKey] = eachData[oldKey];
        });
        return updatedObject;
      });
      setRowData(updatedData);
      // Call forceRerender after setting the new column definitions
      forceRerender();
      setIsHeader(true);
    } catch (error) {
      console.log(error);
    }
  };

  const forceRerender = React.useCallback(() => {
    // if (runCustomRenderer) {
      //just to be safe
      try {
        setColDefs((prevColDefs) => {
          return prevColDefs.map((col) => ({
            ...col,
            cellRenderer: customCellRenderer,
          }));
        });
      } catch (error) {
        console.log(error);
      }
    // } else {
    //   return;
    // }
  }, [customCellRenderer]);

  React.useEffect(() => {
    forceRerender();
    console.log('first');
  }, [forceRerender]);
  // used this to update execute forcererender for data validation
  // the data validation submit button needs two clicks to validate so had to use this for a single click

  const handleCellClicked = React.useCallback((params) => {
    // Update the state when a cell is left-clicked
    setClickedCell({
      column: params.colDef,
      data: params.data,
    });
  }, []);

  const handleDeleteSelectedColumn = () => {
    // Check if a cell has been left-clicked
    if (clickedCell) {
      const { column } = clickedCell;

      // Find the index of the clicked column in colDefs
      const columnIndex = colDefs.findIndex(
        // returns -1 if no index was found
        (col) => col.field === column.field
      );

      if (columnIndex !== -1) {
        // Create a new array of colDefs without the selected column
        const updatedColDefs = [...colDefs];
        // splice is used for adding or removing a part of array
        // the below splice removes the 1 element at given column index value
        updatedColDefs.splice(columnIndex, 1);

        // Set the updated colDefs in the state
        setColDefs(updatedColDefs);

        // Filter out the selected rows from rowData and remove the corresponding column data
        const updatedRowData = rowData.map((row) => {
          const updatedRow = { ...row };
          delete updatedRow[column.field];
          return updatedRow;
        });
        // Set the updated rowData in the state
        setRowData(updatedRowData);
        setJsonData(updatedRowData);

        // Clear the clickedCell state
        setClickedCell(null);
      }
    }
  };

  return (
    <myContext.Provider
      value={{
        forceRerender,
        setRunCustomRenderer,
      }}
    >
      <div className="App h-100">
        {!submitted && (
          <>
            <form
              action=""
              encType="multipart/form-data"
              onSubmit={(e) => handleSubmit(e)}
            >
              <input
                type="file"
                id="file"
                name="file"
                placeholder="file"
                onChange={(e) => handleChange(e)}
              />
              <button className="btn blue-btn">Submit</button>
            </form>
          </>
        )}
        {!rowData || rowData.length === 0 ? (
          <div>No data available.</div>
        ) : (
          <Table
            setIsHeader={setIsHeader}
            isHeader={isHeader}
            colDefs={colDefs}
            setColDefs={setColDefs}
            rowData={rowData}
            handleNewColumnDefn={handleNewColumnDefn}
            isLoading={isLoading}
            setSubmitted={setSubmitted}
            columnDataTypes={columnDataTypes}
            setColumnDataTypes={setColumnDataTypes}
            columnDataTypesChanged={columnDataTypesChanged}
            setColumnDataTypesChanged={setColumnDataTypesChanged}
            setRowData={setRowData}
            handleDeleteSelectedColumn={handleDeleteSelectedColumn}
            handleCellClicked={handleCellClicked}
          />
        )}
      </div>
    </myContext.Provider>
  );
}

export default App;
