import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type CalendarProps = React.ComponentProps<typeof Calendar>;

export type DatePickerWithRangeProps = {
  dateRange: DateRange | undefined;
  onDateRangeChange: (dateRange: DateRange | undefined) => void;
  className?: string;
  disablePastDates?: boolean;
  align?: "start" | "center" | "end";
};

export function DatePickerWithRange({
  dateRange,
  onDateRangeChange,
  className,
  disablePastDates = true,
  align = "start",
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(dateRange);

  React.useEffect(() => {
    setDate(dateRange);
  }, [dateRange]);

  // Configurações para traduzir o calendário para português
  const today = new Date();
  const fromDate = disablePastDates ? today : undefined;
  const toMonth = new Date(today.getFullYear() + 1, today.getMonth());

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione as datas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              setDate(range);
              onDateRangeChange(range);
            }}
            numberOfMonths={2}
            fromDate={fromDate}
            toDate={toMonth}
            locale={ptBR}
            // Traduções adicionais para o calendário
            classNames={{
              caption_label: "text-sm font-medium",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: cn(
                buttonVariants({ variant: "ghost" }),
                "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
              ),
              day_range_end: "day-range-end",
              day_selected:
                "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_range_middle:
                "aria-selected:bg-accent aria-selected:text-accent-foreground",
              day_hidden: "invisible",
              caption: "relative flex items-center justify-center pt-1",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
