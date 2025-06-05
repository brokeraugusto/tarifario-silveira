
import React from 'react';
import { 
  Home, 
  Building2, 
  Search, 
  Calendar, 
  Wrench, 
  Settings,
  DollarSign
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { UserMenu } from '@/components/UserMenu';

const menuItems = [
  {
    title: "Dashboard",
    url: "/home",
    icon: Home,
  },
  {
    title: "Acomodações",
    url: "/accommodations",
    icon: Building2,
  },
  {
    title: "Buscar",
    url: "/search",
    icon: Search,
  },
  {
    title: "Nova Busca",
    url: "/new-search",
    icon: DollarSign,
  },
  {
    title: "Períodos",
    url: "/periods",
    icon: Calendar,
  },
  {
    title: "Manutenção",
    url: "/maintenance",
    icon: Wrench,
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-4 py-2">
          <Building2 className="h-6 w-6 text-hotel-navy" />
          <span className="text-lg font-bold text-hotel-navy">
            Hotel Admin
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <UserMenu />
      </SidebarFooter>
    </Sidebar>
  );
}
