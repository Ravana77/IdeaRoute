import { StrictMode, useState, useEffect, use } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter, Routers, Route, Navigate, useLocation} from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Layout from './Layout.jsx'
import Login from './Login.jsx'

function RequireAuth({ children, isAuthenticated }) //if u are logged in sends u to home page and if u are not sends u to login page
 {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
 }

function RouterWrapper() //if user is authenticated , even he reload the login authentication will not be lost
{
  const [isAuthenticated, setIsAuthentication] = useState
  (()=> localStorage.getItem('isAuthenticated') === 'true');

}

useEffect(() =>
{
  localStorage.getItem('is authenticated', isAuthenticated);
}, [isAuthenticated]);


<><Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} /* when someone login its called onLogin() where isAuthenticated is set to true */ /> 
  <Route path="/app" element={<RequireAuth isAuthenticated={isAuthenticated}>
    <Layout>
      <App />
    </Layout>
  </RequireAuth>} /><Route path="/" element={<Navigate to="/login" replace />} /* when someone goes to home page it redirects to login page */ /> 
</> //when someone goes to home page it redirects to login page

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterWrapper  />
  </StrictMode>,
)
