import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('patricia_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('patricia_user'));
  const [totalConsultas, setTotalConsultas] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('https://dashboard-api-0bfr.onrender.com/api/stats')
        .then(res => res.json())
        .then(data => setTotalConsultas(data.total));
    }
  }, [isAuthenticated]);

  const handleLogin = async (user, pass) => {
    const response = await fetch('https://dashboard-api-0bfr.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, pass })
    });
    const data = await response.json();
    if (data.success) {
      setUserData(data); 
      setIsAuthenticated(true);
      localStorage.setItem('patricia_user', JSON.stringify(data));
    } else {
      alert("Error de acceso");
    }
  };

  return !isAuthenticated ? (
    <Login onLogin={handleLogin} />
  ) : (
    <Dashboard 
      consultas={totalConsultas} 
      user={userData} 
      onLogout={() => {
        setIsAuthenticated(false);
        setUserData(null);
        localStorage.removeItem('patricia_user');
      }} 
    />
  );
}

export default App;