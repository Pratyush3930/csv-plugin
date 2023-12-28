import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [data, setData] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const apiUrl = 'http://localhost:5000/api';
  
  useEffect(() => {
    axios.get(`${apiUrl}/data`)
    .then(response => setData(response.data.message))
    .catch(error => console.log('Error:', error));
  }, [])

  const handleChange = (e) => {
    setSelectedFile(e.target.files[0]);
  }
  
  const handleSubmit =async (e) => {
    console.log('here');
    e.preventDefault();
    console.log(e)
    // creates a empty formData object
    const data = new FormData();
    // append adds a key value pair key='file' value=e.target.f[0]
    data.append('file' , selectedFile);
    console.log(selectedFile);
    try {
      await axios.post(`${apiUrl}/uploadFile`,data)
    .then(res => {
      console.log('here');
      console.log(res.data);
    })
    } catch (error) {
      console.log(error )
    }
  }

  return (
    <div className="App">
      <h1>{data}</h1>
      <form action="" encType='multipart/form-data' onSubmit={(e) => handleSubmit(e)}>
      <input type="file" id='file' name='file' placeholder='file' onChange={e => handleChange(e)}/>
      <button>
        Submit
      </button>
      </form>
    </div>
  );
}

export default App;
