import React from "react";
import { useState } from "react";
import "./App.css";
import axios from "axios";
import Table from "./components/table/table";

function App() {
  const [isHeader, setIsHeader] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jsonData, setJsonData] = useState([]);
  const [rowData, setRowData] = useState([]);
  // const [newRowData, setNewRowData] = useState([]);
  const [colDefs, setColDefs] = useState([]);
  const [keys , setKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  // const [editHeader, setEditHeader] = useState(false);

  const apiUrl = "http://localhost:5000/api";

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      setColDefs(newColumns);
      // below is mapping of oldKeys to newKeys
      const newKeyMapping = Object.keys(jsonData[0]).reduce(
        (result, oldKey, index) => {
          result[oldKey] = newKeys[index] || null;
          return result;
        },
        {}
      );
      const updatedData = jsonData.map((eachData) => {
        const updatedObject = {};
        Object.keys(eachData).forEach((oldKey) => {
          const newKey = newKeyMapping[oldKey];
          updatedObject[newKey] = eachData[oldKey];
        });
        return updatedObject;
      });
      setRowData(updatedData);
      setIsHeader(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
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
            <button className="btn blue-btn">
              Submit
            </button>
          </form>
        </>
      )}
      <Table
        setIsHeader={setIsHeader}
        isHeader={isHeader}
        colDefs={colDefs}
        rowData={rowData}
        handleNewColumnDefn={handleNewColumnDefn}
        isLoading={isLoading}
        setSubmitted={setSubmitted}
      />
    </div>
  );
}

export default App;
