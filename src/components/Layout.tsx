
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bed, Calendar, Users, Settings, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="hotel-layout">
      <aside className="bg-hotel-navy text-white min-h-screen">
        <div className="p-4 flex items-center border-b border-hotel-gold/30">
          <Bed className="w-8 h-8 text-hotel-gold" />
          <span className="ml-2 text-xl font-semibold text-hotel-gold">AcomodaValor</span>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/" 
                className={({ isActive }) => cn(
                  "flex items-center p-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-hotel-gold text-hotel-navy font-medium" 
                    : "hover:bg-hotel-navy/80"
                )}
                end
              >
                <Home className="w-5 h-5 mr-2" />
                <span>Início</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/search" 
                className={({ isActive }) => cn(
                  "flex items-center p-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-hotel-gold text-hotel-navy font-medium" 
                    : "hover:bg-hotel-navy/80"
                )}
              >
                <Search className="w-5 h-5 mr-2" />
                <span>Buscar Acomodações</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/accommodations" 
                className={({ isActive }) => cn(
                  "flex items-center p-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-hotel-gold text-hotel-navy font-medium" 
                    : "hover:bg-hotel-navy/80"
                )}
              >
                <Bed className="w-5 h-5 mr-2" />
                <span>Gerenciar Acomodações</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/periods" 
                className={({ isActive }) => cn(
                  "flex items-center p-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-hotel-gold text-hotel-navy font-medium" 
                    : "hover:bg-hotel-navy/80"
                )}
              >
                <Calendar className="w-5 h-5 mr-2" />
                <span>Períodos e Preços</span>
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/settings" 
                className={({ isActive }) => cn(
                  "flex items-center p-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-hotel-gold text-hotel-navy font-medium" 
                    : "hover:bg-hotel-navy/80"
                )}
              >
                <Settings className="w-5 h-5 mr-2" />
                <span>Configurações</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
