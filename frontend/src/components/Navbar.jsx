import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-black bg-opacity-40 backdrop-blur-lg text-white p-4 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold">CHILL-BOT</div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link to="/navigation" className="hover:underline">Navigation</Link>
          <Link to="/reminder" className="hover:underline">Schedule Reminder</Link>
          <Link to="/emergency" className="hover:underline">Emergency Assistance</Link>
          <Link to="/login" className="hover:underline">Login</Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-2xl focus:outline-none" 
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden flex flex-col items-center mt-4 space-y-3 bg-blue-600 bg-opacity-70 p-4 rounded-lg shadow-lg">
          <Link to="/navigation" className="hover:underline">Navigation</Link>
          <Link to="/reminder" className="hover:underline">Schedule Reminder</Link>
          <Link to="/emergency" className="hover:underline">Emergency Assistance</Link>
          <Link to="/login" className="hover:underline">Login</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;