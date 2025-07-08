import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wrench, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MaintenanceSubmenuProps {
  isMaintenanceOpen: boolean;
  setIsMaintenanceOpen: (open: boolean) => void;
  setIsAreasDialogOpen: (open: boolean) => void;
  handleNavigation: () => void;
  isMobile?: boolean;
}

const MaintenanceSubmenu: React.FC<MaintenanceSubmenuProps> = ({
  isMaintenanceOpen,
  setIsMaintenanceOpen,
  setIsAreasDialogOpen,
  handleNavigation,
  isMobile = false
}) => {
  return (
    <Collapsible open={isMaintenanceOpen} onOpenChange={setIsMaintenanceOpen}>
      <CollapsibleTrigger className={cn(
        "flex items-center justify-between w-full p-2 rounded-md transition-colors",
        "hover:bg-sidebar-accent text-sidebar-foreground"
      )}>
        <div className="flex items-center">
          <Wrench className="w-5 h-5 mr-2" />
          <span>Manutenção</span>
        </div>
        {isMaintenanceOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-4 space-y-1">
        <NavLink 
          to="/maintenance" 
          className={({ isActive }) => cn(
            "flex items-center p-2 rounded-md transition-colors text-sm",
            isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-sidebar-accent text-sidebar-foreground"
          )} 
          onClick={handleNavigation}
        >
          <span className="ml-6">Ordens de Serviço</span>
        </NavLink>
        <button
          className="flex items-center p-2 rounded-md transition-colors text-sm hover:bg-sidebar-accent text-sidebar-foreground w-full text-left"
          onClick={() => {
            setIsAreasDialogOpen(true);
            if (isMobile) handleNavigation();
          }}
        >
          <MapPin className="w-4 h-4 mr-2 ml-6" />
          <span>Gerenciar Áreas</span>
        </button>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default MaintenanceSubmenu;