import React from 'react';

function Footer() {
    return (
        <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-auto">
            <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} ALI ELECTRONICS. All rights reserved.</p>
            </div>
        </footer>
    );
}

export default Footer;
