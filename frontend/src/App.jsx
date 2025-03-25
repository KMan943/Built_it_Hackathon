// import React, { useState } from 'react';
// import axios from 'axios';
// import './App.css';

// function App() {
//   const [question, setQuestion] = useState('');
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [history, setHistory] = useState([]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!question.trim()) return;

//     setLoading(true);
//     setError(null);
    
//     try {
//       const response = await axios.post('http://localhost:5000/query', {
//         question: question
//       });
      
//       setResult(response.data);
//       // Add to history
//       setHistory(prev => [...prev, {
//         question: question,
//         answer: response.data.answer,
//         timestamp: new Date().toLocaleTimeString()
//       }]);
      
//     } catch (err) {
//       console.error('Error querying database:', err);
//       setError(err.response?.data?.error || 'Failed to connect to the server');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatSqlResult = (result) => {
//     try {
//       // Handle different result formats
//       if (result.startsWith('[') && result.endsWith(']')) {
//         const parsed = JSON.parse(result.replace(/'/g, '"'));
//         return (
//           <table className="result-table">
//             <thead>
//               <tr>
//                 {Array.isArray(parsed[0]) ? 
//                   parsed[0].map((_, i) => <th key={i}>Column {i+1}</th>) :
//                   <th>Result</th>
//                 }
//               </tr>
//             </thead>
//             <tbody>
//               {Array.isArray(parsed) && parsed.map((row, i) => (
//                 <tr key={i}>
//                   {Array.isArray(row) ? 
//                     row.map((cell, j) => <td key={j}>{cell}</td>) :
//                     <td>{row}</td>
//                   }
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         );
//       } else {
//         return <pre>{result}</pre>;
//       }
//     } catch (e) {
//       return <pre>{result}</pre>;
//     }
//   };

//   const clearHistory = () => {
//     setHistory([]);
//   };

//   return (
//     <div className="app-container">
//       <header>
//         <h1>SQL Database Query Assistant</h1>
//         <p>Ask questions about your database in natural language</p>
//       </header>

//       <div className="query-container">
//         <form onSubmit={handleSubmit}>
//           <div className="input-group">
//             <input
//               type="text"
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               placeholder="e.g., How many employees are there?"
//               className="query-input"
//             />
//             <button type="submit" disabled={loading} className="submit-button">
//               {loading ? 'Processing...' : 'Ask'}
//             </button>
//           </div>
//         </form>

//         {error && (
//           <div className="error-message">
//             <p>{error}</p>
//           </div>
//         )}

//         {result && (
//           <div className="result-container">
//             <div className="result-card">
//               <h2>Results</h2>
//               <div className="result-section">
//                 <h3>Question</h3>
//                 <p>{result.question}</p>
//               </div>
              
//               {/* <div className="result-section">
//                 <h3>SQL Query</h3>
//                 <pre className="code-block">{result.sql_query}</pre>
//               </div> 
              
//               <div className="result-section">
//                 <h3>SQL Result</h3>
//                 {formatSqlResult(result.sql_result)}
//               </div> */}
              
//               <div className="result-section">
//                 <h3>Answer</h3>
//                 <p className="answer">{result.answer}</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {history.length > 0 && (
//         <div className="history-container">
//           <div className="history-header">
//             <h2>Query History</h2>
//             <button onClick={clearHistory} className="clear-button">Clear History</button>
//           </div>
//           <div className="history-list">
//             {history.map((item, index) => (
//               <div key={index} className="history-item">
//                 <div className="history-time">{item.timestamp}</div>
//                 <div className="history-question">Q: {item.question}</div>
//                 <div className="history-answer">A: {item.answer}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <footer>
//         <p>Powered by LangChain and LangGraph</p>
//       </footer>
//     </div>
//   );
// }

// export default App;



// import Homepage from './pages/Homepage'
// import { RouterProvider, createBrowserRouter, useLocation } from 'react-router-dom'
// import MainLayout from './pages/MainLayout'
// // import { useLocation } from 'react-router-dom'

// const App = () => {
//   const router = createBrowserRouter([
//     {
//       path: "/", element: <MainLayout />, children: [
//         {
//           path: "/",
//           element: <Homepage />,
//         },
//       ]
//     },
//   ]);

//   return <RouterProvider router={router} />;
// }

// export default App


import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [reminders, setReminders] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [hoursBefore, setHoursBefore] = useState(1);
  const [minutesBefore, setMinutesBefore] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  // Fetch reminders on component mount
  useEffect(() => {
    fetchReminders();
    fetchCurrentTime();
    
    // Set up interval to refresh reminders and current time
    const intervalId = setInterval(() => {
      fetchReminders();
      fetchCurrentTime();
    }, 60000); // every minute
    
    return () => clearInterval(intervalId);
  }, []);

  // Change these fetch calls to use the same URL format
const fetchCurrentTime = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/current-time');
    const data = await response.json();
    setCurrentTime(new Date(data.current_time).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata'
    }));
  } catch (error) {
    console.error('Error fetching current time:', error);
  }
};

const fetchReminders = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/reminders');
    const data = await response.json();
    setReminders(data);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    setError('Failed to load reminders');
  }
};




  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    try {
      // Combine date and time
      const eventDateTime = new Date(`${eventDate}T${eventTime}`);
      
      const response = await fetch('http://localhost:5000/api/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: userEmail,
          event_name: eventName,
          event_datetime: eventDateTime.toISOString(),
          hours_before: hoursBefore,
          minutes_before: minutesBefore
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(data.message);
        setEventName('');
        setEventDate('');
        setEventTime('');
        fetchReminders();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error adding reminder:', error);
      setError('Failed to add reminder');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reminders/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setMessage('Reminder deleted successfully');
        fetchReminders();
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
      setError('Failed to delete reminder');
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Reminder System</h1>
        <p>Current Time (IST): {currentTime}</p>
      </header>
      
      <main>
        <div className="container">
          <div className="form-section">
            <h2>Add New Reminder</h2>
            
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="userEmail">Email:</label>
                <input
                  type="email"
                  id="userEmail"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="eventName">Event Name:</label>
                <input
                  type="text"
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="eventDate">Event Date:</label>
                <input
                  type="date"
                  id="eventDate"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="eventTime">Event Time:</label>
                <input
                  type="time"
                  id="eventTime"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Remind me before:</label>
                <div className="time-inputs">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={hoursBefore}
                    onChange={(e) => setHoursBefore(e.target.value)}
                  />
                  <span>hours</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutesBefore}
                    onChange={(e) => setMinutesBefore(e.target.value)}
                  />
                  <span>minutes</span>
                </div>
              </div>
              
              <button type="submit" className="btn-primary">Add Reminder</button>
            </form>
          </div>
          
          <div className="reminders-section">
            <h2>Your Reminders</h2>
            
            {reminders.length === 0 ? (
              <p>No reminders yet.</p>
            ) : (
              <div className="reminders-list">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className={`reminder-card ${reminder.sent ? 'sent' : ''}`}>
                    <h3>{reminder.event_name}</h3>
                    <p><strong>Email:</strong> {reminder.user_email}</p>
                    <p><strong>Event Time:</strong> {new Date(reminder.event_datetime).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}</p>
                    <p><strong>Reminder Time:</strong> {new Date(reminder.reminder_datetime).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}</p>
                    <p><strong>Status:</strong> {reminder.sent ? 'Sent' : 'Pending'}</p>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(reminder.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
