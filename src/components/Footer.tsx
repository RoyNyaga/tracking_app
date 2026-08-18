import React from 'react';
import Link from 'next/link';
import { Ship, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0A192F] text-gray-400 border-t border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 text-white font-bold text-xl">
              <Ship className="h-6 w-6 text-cyan-400" />
              <span>Global Load Logistics</span>
            </div>
            <p className="text-sm max-w-sm">
              Providing dynamic, high-precision supply chain solutions worldwide. From local dispatching to global freight paths, we cover every route with transparency.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cyan-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/tracking" className="hover:text-cyan-400 transition-colors">Track Shipment</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 text-cyan-400 mt-0.5" />
                <a href="mailto:globalloadlogistic@gmail.com" className="hover:text-cyan-400 transition-colors break-all">
                  globalloadlogistic@gmail.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-cyan-400" />
                <span>+1 (800) 555-LOAD</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-cyan-400 mt-0.5" />
                <span>100 Logistics Blvd, Suite 400, New York, NY 10001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 text-center text-xs">
          <p>&copy; {new Date().getFullYear()} Global Load Logistics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
