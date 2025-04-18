
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bed, Calendar, Settings, Search, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import UserMenu from './UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import DatabaseCleanupDialog from './DatabaseCleanupDialog';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({
  children
}: LayoutProps) => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const { user } = useAuth();

  // Close the mobile menu when navigating
  const handleNavigation = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };
  
  const handleCleanupComplete = () => {
    toast.success("Todos os dados foram removidos com sucesso");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {isMobile ? (
        <>
          <div className="bg-silveira-gray text-white p-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/a6911ab3-1a75-4326-9fc0-372d0ab6d779.png" 
                alt="Silveira Eco Village" 
                className="h-10 w-auto" 
              />
            </div>
            <div className="flex items-center gap-2">
              {user && <UserMenu />}
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <button className="p-2">
                    <Menu className="w-6 h-6 text-silveira-green" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] p-0 bg-silveira-gray">
                  <div className="p-4 flex items-center border-b border-silveira-green/30">
                    <img 
                      src="/lovable-uploads/3123768e-9a96-44e8-af21-306a50a822ac.png" 
                      alt="Silveira Logo" 
                      className="h-8 w-auto" 
                    />
                    <button className="ml-auto text-silveira-green" onClick={() => setIsSidebarOpen(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <nav className="p-4">
                    <ul className="space-y-2">
                      <li>
                        <NavLink to="/" className={({isActive}) => cn(
                          "flex items-center p-2 rounded-md transition-colors",
                          isActive ? "bg-silveira-green text-silveira-gray font-medium" : "hover:bg-silveira-gray/80"
                        )} end onClick={handleNavigation}>
                          <Home className="w-5 h-5 mr-2" />
                          <span className="text-slate-50">Início</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/search" className={({isActive}) => cn(
                          "flex items-center p-2 rounded-md transition-colors",
                          isActive ? "bg-silveira-green text-silveira-gray font-medium" : "hover:bg-silveira-gray/80"
                        )} onClick={handleNavigation}>
                          <Search className="w-5 h-5 mr-2" />
                          <span className="text-slate-50">Buscar Acomodações</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/accommodations" className={({isActive}) => cn(
                          "flex items-center p-2 rounded-md transition-colors",
                          isActive ? "bg-silveira-green text-silveira-gray font-medium" : "hover:bg-silveira-gray/80"
                        )} onClick={handleNavigation}>
                          <Bed className="w-5 h-5 mr-2" />
                          <span className="font-normal text-slate-50">Gerenciar Acomodações</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/periods" className={({isActive}) => cn(
                          "flex items-center p-2 rounded-md transition-colors",
                          isActive ? "bg-silveira-green text-silveira-gray font-medium" : "hover:bg-silveira-gray/80"
                        )} onClick={handleNavigation}>
                          <Calendar className="w-5 h-5 mr-2" />
                          <span className="text-slate-50">Períodos e Preços</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/settings" className={({isActive}) => cn(
                          "flex items-center p-2 rounded-md transition-colors",
                          isActive ? "bg-silveira-green text-silveira-gray font-medium" : "hover:bg-silveira-gray/80"
                        )} onClick={handleNavigation}>
                          <Settings className="w-5 h-5 mr-2" />
                          <span className="text-slate-50">Configurações</span>
                        </NavLink>
                      </li>
                    </ul>
                    <div className="mt-8 pt-4 border-t border-silveira-green/30">
                      <Button 
                        variant="destructive" 
                        className="w-full" 
                        onClick={() => setIsCleanupDialogOpen(true)}
                      >
                        Limpar Banco de Dados
                      </Button>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <main className="flex-1 p-4 overflow-x-hidden">
            {children}
          </main>
        </>
      ) : (
        <>
          <aside className="bg-silveira-gray text-white min-h-screen w-[250px] fixed left-0 top-0 bottom-0 overflow-y-auto">
            <div className="p-4 flex items-center justify-between border-b border-silveira-green/30">
              <img 
                src="/lovable-uploads/a6911ab3-1a75-4326-9fc0-372d0ab6d779.png" 
                alt="Silveira Eco Village" 
                className="h-8 w-auto" 
              />
              {user && <UserMenu />}
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <NavLink to="/" className={({isActive}) => cn(
                    "flex items-center p-2 rounded-md transition-colors",
                    isActive ? "bg-silveira-green text-silveira-gray font-medium" : "hover:bg-silveira-gray/80"
                  )} end>
                    <Home className="w-5 h-5 mr-2" />
                    <span>Início</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/search" className={({isActive}) => cn(
                    "flex items-center p-2 rounded-md transition-colors",
                    isActive ? "bg-silveira-green text-silveira-gray font-medium" : "hover:bg-silveira-gray/80"
                  )}>
                    <Search className="w-5 h-5 mr-2" />
                    <span>Buscar Acomodações</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/accommodations" className={({isActive}) => cn(
                    "flex items-center p-2 rounded-md transition-colors",
                    isActive ? "bg-silveira-green text-silveira-gray font-medium" : "hover:bg-silveira-gray/80"
                  )}>
                    <Bed className="w-5 h-5 mr-2" />
                    <span>Gerenciar Acomodações</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/periods" className={({isActive}) => cn(
                    "flex items-center p-2 rounded-md transition-colors",
                    isActive ? "bg-silveira-green text-silveira-gray font-medium" : "hover:bg-silveira-gray/80"
                  )}>
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>Períodos e Preços</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/settings" className={({isActive}) => cn(
                    "flex items-center p-2 rounded-md transition-colors",
                    isActive ? "bg-silveira-green text-silveira-gray font-medium" : "hover:bg-silveira-gray/80"
                  )}>
                    <Settings className="w-5 h-5 mr-2" />
                    <span>Configurações</span>
                  </NavLink>
                </li>
              </ul>
              <div className="mt-8 pt-4 border-t border-silveira-green/30">
                <Button 
                  variant="destructive" 
                  className="w-full" 
                  onClick={() => setIsCleanupDialogOpen(true)}
                >
                  Limpar Banco de Dados
                </Button>
              </div>
            </nav>
          </aside>
          <main className="md:ml-[250px] w-full p-6">
            {children}
          </main>
        </>
      )}
      
      <DatabaseCleanupDialog 
        isOpen={isCleanupDialogOpen}
        onOpenChange={setIsCleanupDialogOpen}
        onCleanupComplete={handleCleanupComplete}
      />
    </div>
  );
};

export default Layout;
