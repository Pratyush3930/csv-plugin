import React from "react";
import "./table.css";

const Table = ({ jsonData }) => {
  // Check if jsonData has any data
  if (!jsonData || jsonData.length === 0) {
    return <div>No data available.</div>;
  }

  // Extract column headers from the first object in jsonData
  const columns = Object.keys(jsonData[0]);

  return (
    <div className="table-section">
      <div className="table">
        <table border={1}>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jsonData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((column, columnIndex) => (
                  <td key={columnIndex}>{row[column]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-ques">
        <p>Does the top column contain your table headings?</p>
        <button className="px-40">Yes</button>
        <button className="button">no</button>
      </div>
    </div>
  );
};

export default Table;
