import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Navigation } from './Navigation';

export const Layout: React.FC = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation />
      <main className="w-full">
        <div className="max-w-[2000px] mx-auto px-4 py-8">
          <div key={location.pathname} className="page-transition-wrapper animate-slideIn">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};