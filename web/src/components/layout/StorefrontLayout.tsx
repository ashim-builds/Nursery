import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';

export const StorefrontLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-[calc(3.75rem+env(safe-area-inset-top,0px))] sm:pt-[calc(4.25rem+env(safe-area-inset-top,0px))]">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <CartDrawer />
    </div>
  );
};
