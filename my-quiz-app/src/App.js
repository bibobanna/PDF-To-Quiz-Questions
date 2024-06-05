import React, { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [questions, setQuestions] = useState('');

  const handleFileChange = event => {
    setFile(event.target.files[0]);
  };

  const handleInputChange = setter => event => {
    setter(event.target.value);
  };

  const handleSubmit = async event => {
    event.preventDefault();
    console.log("Form submitted");
    if (!file || !numQuestions || !apiKey) {
      alert('All fields are required!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('numQuestions', numQuestions);
    formData.append('apiKey', apiKey);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log("Response data:", data);
      setQuestions(data.text);  // Adjust this if the API returns the questions directly
    } catch (error) {
      console.error('Error generating questions:', error);
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <label>
          Upload PDF:
          <input type="file" onChange={handleFileChange} accept="application/pdf" />
        </label>
        <br />
        <label>
          Number of Questions:
          <input type="number" value={numQuestions} onChange={handleInputChange(setNumQuestions)} min="1" />
        </label>
        <br />
        <label>
          OpenAI API Key:
          <input type="text" value={apiKey} onChange={handleInputChange(setApiKey)} />
        </label>
        <br />
        <button type="submit">Generate Quiz</button>
      </form>
      <br />
      <label>
        Generated Quiz Questions:
        <textarea value={questions} readOnly rows="10" cols="50" />
      </label>
    </div>
  );
}

export default App;
