export interface IWeekNavigatorProps {
  startDate: string;
  endDate: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}