import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {createBrowserRouter, RouterProvider, Navigate} from "react-router-dom"

// Private Router
import PrivateRoute from './utils/PrivateRoute.jsx'

// Routes
import Home from './routes/Home.jsx'
import LoginPage from './routes/login_and_register_form/LoginPage.jsx'
import RegisterPage from './routes/login_and_register_form/RegisterPage.jsx'
import Dashboard from './routes/dashboard_page/Dashboard.jsx'
import Profile from './routes/Profile.jsx'
import VerifyEmail from "./routes/verify_email_page/VerifyEmail.jsx";



// contexts
import {AuthProvider} from './context/AuthContext.jsx'



const routers = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: '/',
                element: <Home /> 
            },

            {
                path: '/login',
                element: <LoginPage/>
            },

            {
                path: '/register',
                element: <RegisterPage />
            },

            {
                path: '/verify-email/:url_code',
                element: <VerifyEmail />
            },

            {
                path: '/dashboard',
                element: <PrivateRoute><Dashboard /></PrivateRoute>
            },

             {
                path: '/your-profile',
                element: <PrivateRoute><Profile /></PrivateRoute>
            },
            
            
        ]
    }
])



createRoot(document.getElementById('root')).render(
  <StrictMode>
      <AuthProvider>
          <RouterProvider router={routers} />
      </AuthProvider>

  </StrictMode>
)
