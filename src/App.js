import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faX } from "@fortawesome/free-solid-svg-icons";
import { useState} from "react";
import "./App.css";
import axios from "axios";
import Table from "./components/table/table";
import myContext from "./utils/context/myContext";

function App() {
  const [isHeader, setIsHeader] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jsonData, setJsonData] = useState([]);
  const [rowData, setRowData] = useState([]);
  // const [newRowData, setNewRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);
  const [keys, setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [columnDataTypesChanged, setColumnDataTypesChanged] = useState(false);
  const [columnDataTypes, setColumnDataTypes] = useState({});
  const [runCustomRenderer, setRunCustomRenderer] = useState(false);

  // const [editHeader, setEditHeader] = useState(false);

  const apiUrl = "http://localhost:5000/api";


  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };


  const customCellRenderer = React.useCallback((params) => {
    if(!runCustomRenderer){
      return params.value;
    }
    const value = params.value;
    const columnName = params.colDef.field;
    console.log('each column name is:', columnName)
  
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
                    if (typeof row[column] !== "string" || !isNaN(Number(row[column]))) {
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
      <FontAwesomeIcon icon={faX} style={{ color: 'red' }} />
    ) : (
      <FontAwesomeIcon icon={faCheck} style={{ color: 'green' }} />
    );
  
    return (
      <div className="flex gap-1 justify-start items-center">
        {cellStyle}
        {value}
      </div>
    );
  }, [columnDataTypesChanged, columnDataTypes, rowData, runCustomRenderer]);
  
  

 
  
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
        //   const lastValidation = res.data.map((innerArray) => {
        //       return innerArray.map((eachData) => console.log(eachData));
        //   })
        // setNewRowData(lastValidation);
        setKeys(Object.keys(res.data[0]));
        const findKey = Object.keys(res.data[0]).map((eachKey) => ({
          field: eachKey,
          headerName: eachKey,
          cellRenderer: customCellRenderer
        }));
        // setTimeout(() => {
        setColDefs(findKey);
        setIsLoading(false);
        // }, 2000);
        setSubmitted(true);
      });
    } catch (error) {
      console.log(error);
    }
  };

  // const handleNewColumnDefn = (e) => {
  //   e.preventDefault();
  //   setRunCustomRenderer(false);
  //   try {
  //     let colLength = colDefs.length;
  //     let i = 0;
  //     let newColumns = [];
  //     let newKeys = [];
  //     while (i < colLength) {
  //       // to access value dynamically below syntax
  //       let newCol = e.target[`val${i}`]?.value;
  //       newCol = newCol ? newCol : keys[i];
  //       // created an array of keys in newKeys using each value of newCol
  //       newKeys.push(newCol);
  //       const column = { field: newCol, headerName: newCol, cellRenderer: customCellRenderer };
  //       // pushing each column value to newColumns and creating a array of objects
  //       newColumns.push(column);
  //       i++;
  //     }
  //     console.log('newcolmn:', newColumns);
  //     console.log('newkeys:', newKeys);
  //     setColDefs(newColumns);
  //     // below is mapping of oldKeys to newKeys
     
  //     const newKeyMapping = Object.keys(jsonData[0]).reduce(
  //       (result, oldKey, index) => {
  //         result[oldKey] = newKeys[index] || null;
  //         return result;
  //       },
  //       {}
  //     );
  //     console.log("newkeymapping", newKeyMapping);
  //     console.log("rowdata lai map grna", rowData[0]);
  //     const updatedData = jsonData.map((eachData) => {
  //       const updatedObject = {};
  //       Object.keys(eachData).forEach((oldKey) => {
  //         const newKey = newKeyMapping[oldKey];
  //         updatedObject[newKey] = eachData[oldKey];
  //       });
  //       return updatedObject;
  //     });
  //     console.log("updateddata", updatedData);
  //     setRowData(updatedData);
  //     setIsHeader(true);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handleNewColumnDefn = (e) => {
    e.preventDefault();
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
      console.log("object.keys", Object.keys(jsonData[0]));
      console.log("newcolumn", newKeys);
      setColDefs(newColumns);
      // below is mapping of oldKeys to newKeys
      const newKeyMapping = Object.keys(jsonData[0]).reduce(
        (result, oldKey, index) => {
          result[oldKey] = newKeys[index] || null;
          return result;
        },
        {} //it is the initial value of the accumulator that is result in this case
      );
      console.log("newkeymapping", newKeyMapping);
      console.log("rowdata lai map grna", rowData[0]);
      const updatedData = jsonData.map((eachData) => {
        const updatedObject = {};
        Object.keys(eachData).forEach((oldKey) => {
          const newKey = newKeyMapping[oldKey];
          updatedObject[newKey] = eachData[oldKey];
        });
        return updatedObject;
      });
      console.log("updateddata", updatedData);
      setRowData(updatedData);
      setIsHeader(true);
    } catch (error) {
      console.log(error);
    }
  };

  const forceRerender = React.useCallback(() => {
    if(runCustomRenderer){
    try {
      setColDefs((prevColDefs) => {
        return prevColDefs.map((col) => ({
          ...col,
          cellRenderer: customCellRenderer
        }));
      });
    } catch (error) {
      console.log(error);
    }
  }
}, [customCellRenderer, runCustomRenderer])

  // React.useEffect(() => {
  //   forceRerender();
  // }, [forceRerender]);

  React.useEffect(() => {
    console.log('the new col defns are:', colDefs);
  }, [colDefs]);


  
  return (
    <myContext.Provider 
    value={{
      forceRerender,
      setRunCustomRenderer
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
        />
      )}
    </div>
    </myContext.Provider>
  );
}

export default App;
