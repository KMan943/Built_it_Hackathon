import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/query', {
        question: question
      });
      
      setResult(response.data);
      // Add to history
      setHistory(prev => [...prev, {
        question: question,
        answer: response.data.answer,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
    } catch (err) {
      console.error('Error querying database:', err);
      setError(err.response?.data?.error || 'Failed to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const formatSqlResult = (result) => {
    try {
      // Handle different result formats
      if (result.startsWith('[') && result.endsWith(']')) {
        const parsed = JSON.parse(result.replace(/'/g, '"'));
        return (
          <table className="result-table">
            <thead>
              <tr>
                {Array.isArray(parsed[0]) ? 
                  parsed[0].map((_, i) => <th key={i}>Column {i+1}</th>) :
                  <th>Result</th>
                }
              </tr>
            </thead>
            <tbody>
              {Array.isArray(parsed) && parsed.map((row, i) => (
                <tr key={i}>
                  {Array.isArray(row) ? 
                    row.map((cell, j) => <td key={j}>{cell}</td>) :
                    <td>{row}</td>
                  }
                </tr>
              ))}
            </tbody>
          </table>
        );
      } else {
        return <pre>{result}</pre>;
      }
    } catch (e) {
      return <pre>{result}</pre>;
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="app-container">
      <header>
        <h1>SQL Database Query Assistant</h1>
        <p>Ask questions about your database in natural language</p>
      </header>

      <div className="query-container">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g., How many employees are there?"
              className="query-input"
            />
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Processing...' : 'Ask'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="result-container">
            <div className="result-card">
              <h2>Results</h2>
              <div className="result-section">
                <h3>Question</h3>
                <p>{result.question}</p>
              </div>
              
              {/* <div className="result-section">
                <h3>SQL Query</h3>
                <pre className="code-block">{result.sql_query}</pre>
              </div> 
              
              <div className="result-section">
                <h3>SQL Result</h3>
                {formatSqlResult(result.sql_result)}
              </div> */}
              
              <div className="result-section">
                <h3>Answer</h3>
                <p className="answer">{result.answer}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="history-container">
          <div className="history-header">
            <h2>Query History</h2>
            <button onClick={clearHistory} className="clear-button">Clear History</button>
          </div>
          <div className="history-list">
            {history.map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-time">{item.timestamp}</div>
                <div className="history-question">Q: {item.question}</div>
                <div className="history-answer">A: {item.answer}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer>
        <p>Powered by LangChain and LangGraph</p>
      </footer>
    </div>
  );
}

export default App;
