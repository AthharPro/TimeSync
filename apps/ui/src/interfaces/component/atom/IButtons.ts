export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  monthName: string;
}

export interface WeekNavigatorProps {
  weekDays: WeekDay[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}