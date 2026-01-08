import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
// import BookStore from './pages/bookStore/bookStore'; 

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* <Route path="/bookstore" element={<BookStore />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
