import React from 'react'
import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import Navbar from '../components/Navbar'


const MainLayout = () => {
  return (
    <>  
        <div style={pageContainerStyle}>
          <div  style={contentStyle}>
            <Outlet />
            <ToastContainer />
          </div>
        </div>
    </>
  );
};

const pageContainerStyle = {
  display: "flex",
  flexDirection: "column",
  minHeight: "93.75vh", // Full viewport height
};

const contentStyle = {
  flex: "1", // Takes remaining space, pushing the footer to the bottom
};

export default MainLayout