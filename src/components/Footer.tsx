'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 border-t border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Section: Logo & Copyright */}
        <div className="space-y-2 text-center md:text-left">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent inline-block"
          >
            FundVerse
          </Link>
          <p className="text-sm text-gray-400">
            &copy; 2024 FundVerse. All rights reserved.
          </p>
        </div>

        {/* Right Section: Follow Us & Social Links */}
        <div className="text-center md:text-right space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300">
            Follow Us
          </h4>
          <div className="flex flex-wrap justify-center md:justify-end items-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-blue-400 transition font-medium">
              LinkedIn
            </a>
            <a href="#" className="hover:text-blue-400 transition font-medium">
              GitHub
            </a>
            <a href="#" className="hover:text-blue-400 transition font-medium">
              Facebook
            </a>
            <a href="#" className="hover:text-blue-400 transition font-medium">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
