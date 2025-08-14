import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navigation from './components/Navigation';
import Homepage from './pages/Homepage';
import Map from './pages/Map';
import Upload from './pages/Upload';
import Profile from './pages/Profile';

function App() {
  // Persist minimal user info.
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedLogin = localStorage.getItem("login");
    if (savedLogin) {
      setUser(JSON.parse(savedLogin));
    }
  }, []);

  return (
    // Provide Google OAuth info and set up routing.
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        <div className="App">
          <Navigation user={user} setUser={setUser} />
          <Routes>
            <Route path="/" element={<Homepage user={user} />} />
            <Route path="/map" element={<Map user={user} />} />
            <Route path="/upload" element={<Upload user={user} />} />
            <Route path="/profile" element={<Profile user={user} setUser={setUser} />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App; 