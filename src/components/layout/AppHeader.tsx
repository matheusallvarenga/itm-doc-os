import { Bell, MagnifyingGlass, Sun, Moon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";

export function AppHeader() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative max-w-md flex-1">
        <MagnifyingGlass weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-10 bg-secondary/50 border-border/50 focus:border-primary"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? (
            <Sun weight="regular" className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          ) : (
            <Moon weight="regular" className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell weight="light" className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">Dr. Marcel Pita</p>
            <p className="text-xs text-muted-foreground">Ortopedista</p>
          </div>
          <Avatar className="w-9 h-9 border-2 border-primary/20">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
              MP
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
