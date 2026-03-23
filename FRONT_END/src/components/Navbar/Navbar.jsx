import React from "react";
import logo from "../../assets/logo.png";
import "./Navbar.css";

function Navbar() {
    return (
        <nav className="navbar">
            <img src={logo} alt="logo" className="logo" />
            <h1 className="navbar-title">Plantation Monitoring System</h1>
        </nav>
    );
}

export default Navbar;
