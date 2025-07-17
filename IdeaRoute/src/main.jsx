import { StrictMode, useState, useEffect } from 'react';//  React core tools
import { createRoot } from 'react-dom/client';// React DOM tool to connect React to HTML <div id="root">
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';// 🛣️ Tools from react-router-dom to handle page routing
import './index.css';
import App from './App.jsx';
import Layout from './Layout.jsx';
import Login from './Login.jsx';


// This component prevents access to private pages if not logged in
function RequireAuth({ children, isAuthenticated }) {
  const location = useLocation();  // 📍 Find out where the user tried to go

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;//  If user is not logged in, send them to login page &  Save the original location so they can go back after login
  }
  return children;// If logged in, show the page content
}



function RouterWrapper() {  //  The Router — Main App Controller
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('isAuthenticated') === 'true'  //  Track whether the user is logged in & Remember login even after refresh
  );

  //  When login status changes, save it in localStorage
  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  return (
    <BrowserRouter> {/*  Wrap the app to enable routing */}
      <Routes> {/*  List of all routes in the app */}
        {/*  Login Page (Landing page) */}
        <Route
          path="/login"
          element={<Login onLogin={() => setIsAuthenticated(true)} />}
        //  When user logs in successfully, isAuthenticated becomes true
        />

        {/*  Protected Main Page (Only shows if logged in) */}
        <Route
          path="/app"
          element={
            <RequireAuth isAuthenticated={isAuthenticated}>
              <Layout>
                <App />
              </Layout>
            </RequireAuth>
          }
        />
        {/*  So when someone types just the base URL, they are sent to the login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
}



createRoot(document.getElementById('root')).render( // Render the App to the Browser
  <StrictMode>
    <RouterWrapper /> {/* Start the app here */}
  </StrictMode>
);
