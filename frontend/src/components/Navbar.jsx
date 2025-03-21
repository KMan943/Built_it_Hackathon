import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";

const Navbar = () => {

    return (
        <>
            <header className="header">
                <NavLink to="/" className="logo">
                    FLUXUS
                </NavLink>
                <div className="navbar">
                    <NavLink to="/events">Events</NavLink>
                    <NavLink to="/competitions">Competitions</NavLink>
                    <NavLink to="/speakers">Speakers</NavLink>
                    <NavLink to="/gallery">Gallery</NavLink>
                    <NavLink to="/partners">Partners</NavLink>
                    <NavLink to="/team">Team</NavLink>
                    {loggedIn ? (
                        <>
                        <NavLink to="/dashboard">Dashboard</NavLink>
                        <NavLink to="/login" onClick={()=>handleLogout()}>Logout</NavLink>
                        </>
                    ) : (
                        <NavLink to="/login">Login</NavLink>
                    )}
                </div>
            </header>
        </>
    );
}

export default Navbar;
