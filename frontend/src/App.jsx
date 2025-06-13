import { useState } from 'react'
import {Outlet} from 'react-router-dom';
import './App.css'
import {AuthProvider} from './context/AuthContext.jsx'
import {TaskProvider} from './context/TaskContext.jsx'

// Components
import NavBar from './components/navbar/NavBar.jsx'



function App() {


  return (
    <div>



        <NavBar />

          <TaskProvider>
              <Outlet />
          </TaskProvider>


    </div>
  )
}

export default App
