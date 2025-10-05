import { LogOut, LogIn } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export const OccupancyLegend = () => {
  return (
    <>
      {/* Desktop version */}
      <div className="hidden md:flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded" />
          <span className="text-sm">Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded" />
          <span className="text-sm">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded" />
          <span className="text-sm">Check-in</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded" />
          <span className="text-sm">Bloqueada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-background border rounded" />
          <span className="text-sm">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <LogOut className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Check-out</span>
        </div>
        <div className="flex items-center gap-2">
          <LogIn className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Check-in</span>
        </div>
      </div>

      {/* Mobile version - Compact popover */}
      <Popover>
        <PopoverTrigger asChild className="md:hidden">
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4 mr-2" />
            Legenda
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="start">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Status das Reservas</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded flex-shrink-0" />
                <span className="text-sm">Confirmada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded flex-shrink-0" />
                <span className="text-sm">Pendente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded flex-shrink-0" />
                <span className="text-sm">Check-in realizado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded flex-shrink-0" />
                <span className="text-sm">Bloqueada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-background border rounded flex-shrink-0" />
                <span className="text-sm">Disponível</span>
              </div>
            </div>
            <div className="pt-2 border-t space-y-2">
              <h4 className="font-semibold text-sm">Eventos</h4>
              <div className="flex items-center gap-2">
                <LogOut className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">Check-out (saída)</span>
              </div>
              <div className="flex items-center gap-2">
                <LogIn className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">Check-in (entrada)</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
};
