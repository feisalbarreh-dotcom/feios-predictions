import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar() {
    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <NavLink to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    ALI ELECTRONICS
                </NavLink>
                <ul className="flex space-x-6">
                                    <li><NavLink to="/home" className={"nav-link"}>{"Home"}</NavLink></li>
                <li><NavLink to="/products" className={"nav-link"}>{"Products"}</NavLink></li>
                <li><NavLink to="/contact" className={"nav-link"}>{"Contact"}</NavLink></li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
