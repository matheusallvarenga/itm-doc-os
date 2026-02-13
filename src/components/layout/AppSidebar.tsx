import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TriangleLogo } from "@/components/TriangleLogo";
import {
  SquaresFour,
  Gauge,
  FileText,
  Crosshair,
  ChatCircle,
  VideoCamera,
  Stethoscope,
  ChartBar,
  Trophy,
  Gear,
  User,
  Users,
  CaretLeft,
  CaretRight,
  Funnel,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const menuItems = [
  { title: "Dashboard", url: "/", icon: SquaresFour },
  { title: "Dashboard 2", url: "/dashboard2", icon: Gauge },
  { title: "Roteiros", url: "/roteiros", icon: FileText },
  { title: "Decodificar Paciente", url: "/decodificar", icon: Crosshair },
  { title: "Simulador", url: "/simulador", icon: ChatCircle },
  { title: "Analisar Vídeo", url: "/videos", icon: VideoCamera },
  { title: "Analisar Consulta", url: "/consultas", icon: Stethoscope },
  { title: "Funil de Vendas", url: "/funil", icon: Funnel },
  { title: "Meu Instagram", url: "/instagram", icon: ChartBar },
  { title: "Ranking", url: "/ranking", icon: Trophy },
];

const bottomItems = [
  { title: "Configurações", url: "/configuracoes", icon: Gear },
  { title: "Perfil", url: "/perfil", icon: User },
];

// Admin only
const adminItems = [
  { title: "Gerenciar Alunos", url: "/admin/alunos", icon: Users },
];

interface AppSidebarProps {
  isAdmin?: boolean;
}

export function AppSidebar({ isAdmin = false }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ item, showTooltip = false }: { item: typeof menuItems[0]; showTooltip?: boolean }) => {
    const content = (
      <NavLink
        to={item.url}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          "hover:bg-sidebar-accent text-muted-foreground hover:text-foreground",
          isActive(item.url) && "bg-primary/10 text-primary border-l-2 border-primary"
        )}
      >
        <item.icon 
          weight={isActive(item.url) ? "regular" : "light"} 
          className={cn("w-5 h-5 flex-shrink-0", isActive(item.url) ? "text-primary" : "text-[#9CA3AF]")} 
        />
        {!collapsed && (
          <span className="text-sm font-medium truncate">{item.title}</span>
        )}
      </NavLink>
    );

    if (collapsed && showTooltip) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-card border-border">
            {item.title}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
          <TriangleLogo size="sm" animate />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground tracking-wide">
                CÓDIGO DE
              </span>
              <span className="text-sm font-semibold text-primary tracking-wide">
                PODER
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full border border-border bg-card hover:bg-accent z-10"
      >
        {collapsed ? (
          <CaretRight weight="bold" className="w-3 h-3" />
        ) : (
          <CaretLeft weight="bold" className="w-3 h-3" />
        )}
      </Button>

      {/* Main navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavItem key={item.url} item={item} showTooltip />
        ))}

        {isAdmin && (
          <>
            <div className="my-4 border-t border-sidebar-border" />
            {adminItems.map((item) => (
              <NavItem key={item.url} item={item} showTooltip />
            ))}
          </>
        )}
      </nav>

      {/* Bottom navigation */}
      <div className="p-3 space-y-1 border-t border-sidebar-border">
        {bottomItems.map((item) => (
          <NavItem key={item.url} item={item} showTooltip />
        ))}
      </div>
    </aside>
  );
}
