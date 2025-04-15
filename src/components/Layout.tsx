
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bed, Calendar, Settings, Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close the mobile menu when navigating
  const handleNavigation = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {isMobile ? (
        <>
          <div className="bg-hotel-navy text-white p-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center">
              <Bed className="w-8 h-8 text-hotel-gold" />
              <span className="ml-2 text-xl font-semibold text-hotel-gold">Tarifário Silveira</span>
            </div>
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <button className="p-2">
                  <Menu className="w-6 h-6 text-hotel-gold" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[250px] p-0 bg-hotel-navy">
                <div className="p-4 flex items-center border-b border-hotel-gold/30">
                  <Bed className="w-8 h-8 text-hotel-gold" />
                  <span className="ml-2 text-xl font-semibold text-hotel-gold">Tarifário Silveira</span>
                  <button 
                    className="ml-auto text-hotel-gold"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="p-4">
                  <ul className="space-y-2">
                    <li>
                      <NavLink 
                        to="/" 
                        className={({isActive}) => cn(
                          "flex items-center p-2 rounded-md transition-colors", 
                          isActive ? "bg-hotel-gold text-hotel-navy font-medium" : "hover:bg-hotel-navy/80"
                        )} 
                        end
                        onClick={handleNavigation}
                      >
                        <Home className="w-5 h-5 mr-2" />
                        <span>Início</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        to="/search" 
                        className={({isActive}) => cn(
                          "flex items-center p-2 rounded-md transition-colors", 
                          isActive ? "bg-hotel-gold text-hotel-navy font-medium" : "hover:bg-hotel-navy/80"
                        )}
                        onClick={handleNavigation}
                      >
                        <Search className="w-5 h-5 mr-2" />
                        <span>Buscar Acomodações</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        to="/accommodations" 
                        className={({isActive}) => cn(
                          "flex items-center p-2 rounded-md transition-colors", 
                          isActive ? "bg-hotel-gold text-hotel-navy font-medium" : "hover:bg-hotel-navy/80"
                        )}
                        onClick={handleNavigation}
                      >
                        <Bed className="w-5 h-5 mr-2" />
                        <span>Gerenciar Acomodações</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        to="/periods" 
                        className={({isActive}) => cn(
                          "flex items-center p-2 rounded-md transition-colors", 
                          isActive ? "bg-hotel-gold text-hotel-navy font-medium" : "hover:bg-hotel-navy/80"
                        )}
                        onClick={handleNavigation}
                      >
                        <Calendar className="w-5 h-5 mr-2" />
                        <span>Períodos e Preços</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink 
                        to="/settings" 
                        className={({isActive}) => cn(
                          "flex items-center p-2 rounded-md transition-colors", 
                          isActive ? "bg-hotel-gold text-hotel-navy font-medium" : "hover:bg-hotel-navy/80"
                        )}
                        onClick={handleNavigation}
                      >
                        <Settings className="w-5 h-5 mr-2" />
                        <span>Configurações</span>
                      </NavLink>
                    </li>
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <main className="flex-1 p-4 overflow-x-hidden">
            {children}
          </main>
        </>
      ) : (
        <>
          <aside className="bg-hotel-navy text-white min-h-screen w-[250px] fixed left-0 top-0 bottom-0 overflow-y-auto">
            <div className="p-4 flex items-center border-b border-hotel-gold/30">
              <Bed className="w-8 h-8 text-hotel-gold" />
              <span className="ml-2 text-xl font-semibold text-hotel-gold">Tarifário Silveira</span>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <NavLink to="/" className={({isActive}) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-hotel-gold text-hotel-navy font-medium" : "hover:bg-hotel-navy/80")} end>
                    <Home className="w-5 h-5 mr-2" />
                    <span>Início</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/search" className={({isActive}) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-hotel-gold text-hotel-navy font-medium" : "hover:bg-hotel-navy/80")}>
                    <Search className="w-5 h-5 mr-2" />
                    <span>Buscar Acomodações</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/accommodations" className={({isActive}) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-hotel-gold text-hotel-navy font-medium" : "hover:bg-hotel-navy/80")}>
                    <Bed className="w-5 h-5 mr-2" />
                    <span>Gerenciar Acomodações</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/periods" className={({isActive}) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-hotel-gold text-hotel-navy font-medium" : "hover:bg-hotel-navy/80")}>
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>Períodos e Preços</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings" className={({isActive}) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-hotel-gold text-hotel-navy font-medium" : "hover:bg-hotel-navy/80")}>
                    <Settings className="w-5 h-5 mr-2" />
                    <span>Configurações</span>
                  </NavLink>
                </li>
              </ul>
            </nav>
          </aside>
          <main className="md:ml-[250px] w-full p-6">
            {children}
          </main>
        </>
      )}
    </div>
  );
};

export default Layout;
