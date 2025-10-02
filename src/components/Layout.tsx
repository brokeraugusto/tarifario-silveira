import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bed, Calendar, Settings, Search, Menu, X, Users, BookOpen, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import UserMenu from './UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import DatabaseCleanupDialog from './DatabaseCleanupDialog';
import AreasManagementDialog from './maintenance/AreasManagementDialog';
import MaintenanceSubmenu from './layout/MaintenanceSubmenu';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [isAreasDialogOpen, setIsAreasDialogOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const {
    user
  } = useAuth();

  // Close the mobile menu when navigating
  const handleNavigation = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };
  const handleCleanupComplete = () => {
    toast.success("Todos os dados foram removidos com sucesso");
  };
  return <div className="min-h-screen flex flex-col md:flex-row">
      {isMobile ? <>
          <div className="bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center">
              <img src="/lovable-uploads/a6911ab3-1a75-4326-9fc0-372d0ab6d779.png" alt="Silveira Eco Village" className="h-10 w-auto" />
            </div>
            <div className="flex items-center gap-2">
              {user && <UserMenu />}
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <button className="p-2">
                    <Menu className="w-6 h-6 text-hotel-green" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[250px] p-0 bg-sidebar">
                  <div className="p-4 flex items-center border-b border-hotel-green/30">
                    <img src="/lovable-uploads/3123768e-9a96-44e8-af21-306a50a822ac.png" alt="Silveira Logo" className="h-8 w-auto" />
                    <button className="ml-auto text-hotel-green" onClick={() => setIsSidebarOpen(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <nav className="p-4">
                    <ul className="space-y-2">
                      <li>
                        <NavLink to="/" className={({
                      isActive
                    }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} end onClick={handleNavigation}>
                          <Home className="w-5 h-5 mr-2" />
                          <span className="text-sidebar-foreground">Início</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/search" className={({
                      isActive
                    }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} onClick={handleNavigation}>
                          <Search className="w-5 h-5 mr-2" />
                          <span className="text-sidebar-foreground">Buscar Acomodações</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/accommodations" className={({
                      isActive
                    }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} onClick={handleNavigation}>
                          <Bed className="w-5 h-5 mr-2" />
                          <span className="font-normal text-sidebar-foreground">Gerenciar Acomodações</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/periods" className={({
                      isActive
                    }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} onClick={handleNavigation}>
                          <Calendar className="w-5 h-5 mr-2" />
                          <span className="text-sidebar-foreground">Períodos e Preços</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/reservations" className={({
                      isActive
                    }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} onClick={handleNavigation}>
                          <BookOpen className="w-5 h-5 mr-2" />
                          <span className="text-sidebar-foreground">Reservas</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/guests" className={({
                      isActive
                    }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} onClick={handleNavigation}>
                          <Users className="w-5 h-5 mr-2" />
                          <span className="text-sidebar-foreground">Hóspedes</span>
                        </NavLink>
                      </li>
                      <li>
                        <NavLink to="/occupancy" className={({
                      isActive
                    }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} onClick={handleNavigation}>
                          <LayoutGrid className="w-5 h-5 mr-2" />
                          <span className="text-sidebar-foreground">Ocupação</span>
                        </NavLink>
                      </li>
                       <li>
                         <MaintenanceSubmenu isMaintenanceOpen={isMaintenanceOpen} setIsMaintenanceOpen={setIsMaintenanceOpen} setIsAreasDialogOpen={setIsAreasDialogOpen} handleNavigation={handleNavigation} isMobile={true} />
                       </li>
                      <li>
                        <NavLink to="/settings" className={({
                      isActive
                    }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} onClick={handleNavigation}>
                          <Settings className="w-5 h-5 mr-2" />
                          <span className="text-sidebar-foreground">Configurações</span>
                        </NavLink>
                      </li>
                    </ul>
                    <div className="mt-8 pt-4 border-t border-hotel-green/30">
                      <Button variant="destructive" className="w-full" onClick={() => setIsCleanupDialogOpen(true)}>
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
        </> : <>
          <aside className={cn(
            "text-sidebar-foreground min-h-screen fixed left-0 top-0 bottom-0 overflow-y-auto bg-neutral-700 transition-all duration-300",
            isSidebarCollapsed ? "w-16" : "w-[250px]"
          )}>
            <div className="p-4 flex items-center justify-between border-b border-hotel-green/30">
              {!isSidebarCollapsed && (
                <img alt="Silveira Eco Village" src="/lovable-uploads/53dac66f-17e6-433a-8bb7-f777bbe4d70c.png" className="h-8 w-auto object-contain" />
              )}
              <div className="flex items-center gap-2">
                {!isSidebarCollapsed && user && <UserMenu />}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 hover:bg-sidebar-accent/20"
                >
                  {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <NavLink to="/" className={({
                isActive
              }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} end title="Início">
                    <Home className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="ml-2">Início</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/search" className={({
                isActive
              }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} title="Buscar Acomodações">
                    <Search className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="ml-2">Buscar Acomodações</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/accommodations" className={({
                isActive
              }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} title="Gerenciar Acomodações">
                    <Bed className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="ml-2">Gerenciar Acomodações</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/periods" className={({
                isActive
              }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} title="Períodos e Preços">
                    <Calendar className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="ml-2">Períodos e Preços</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/reservations" className={({
                isActive
              }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} title="Reservas">
                    <BookOpen className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="ml-2">Reservas</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/guests" className={({
                isActive
              }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} title="Hóspedes">
                    <Users className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="ml-2">Hóspedes</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/occupancy" className={({
                isActive
              }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} title="Mapa de Ocupação">
                    <LayoutGrid className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="ml-2">Mapa de Ocupação</span>}
                  </NavLink>
                </li>
                 {!isSidebarCollapsed && (
                   <li>
                     <MaintenanceSubmenu isMaintenanceOpen={isMaintenanceOpen} setIsMaintenanceOpen={setIsMaintenanceOpen} setIsAreasDialogOpen={setIsAreasDialogOpen} handleNavigation={handleNavigation} />
                   </li>
                 )}
                <li>
                  <NavLink to="/settings" className={({
                isActive
              }) => cn("flex items-center p-2 rounded-md transition-colors", isActive ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" : "hover:bg-sidebar-accent/20")} title="Configurações">
                    <Settings className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && <span className="ml-2">Configurações</span>}
                  </NavLink>
                </li>
              </ul>
            </nav>
          </aside>
          <main className={cn(
            "w-full p-6 transition-all duration-300",
            isSidebarCollapsed ? "md:ml-16" : "md:ml-[250px]"
          )}>
            {children}
          </main>
        </>}
      
      <DatabaseCleanupDialog isOpen={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen} onCleanupComplete={handleCleanupComplete} />
      <AreasManagementDialog isOpen={isAreasDialogOpen} onOpenChange={setIsAreasDialogOpen} />
    </div>;
};
export default Layout;