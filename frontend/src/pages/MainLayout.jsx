import React from 'react'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import Navbar from '../components/Navbar'


const MainLayout = () => {
  return (
    <>  
        <div>
          <Navbar/>
          <div>
            <Outlet />
            <ToastContainer />
          </div>
        </div>
    </>
  );
};


export default MainLayout