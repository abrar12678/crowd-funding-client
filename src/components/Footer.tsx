'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-4">
          <Link href="/" className="text-2xl font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            FundVerse
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            The next-generation crowdfunding ecosystem empowering creators and supporters around the world.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#top-campaigns" className="hover:text-white transition">Explore Campaigns</Link></li>
            <li><Link href="/register" className="hover:text-white transition">Start a Campaign</Link></li>
            <li><Link href="/login" className="hover:text-white transition">Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Categories</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white transition">Technology & AI</Link></li>
            <li><Link href="#" className="hover:text-white transition">Eco-Friendly Projects</Link></li>
            <li><Link href="#" className="hover:text-white transition">Gaming & Interactive</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Community</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-white transition">Join as Developer</Link></li>
            <li><Link href="#" className="hover:text-white transition">Help & Support</Link></li>
            <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} FundVerse Platform. All rights reserved.
      </div>
    </footer>
  );
}
