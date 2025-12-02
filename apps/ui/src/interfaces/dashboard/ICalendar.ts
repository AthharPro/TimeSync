export interface ICalendarEvent {
  date: Date;
  title: string;
  type: 'deadline' | 'meeting' | 'holiday' | 'milestone';
}

export interface IHoursChartData {
  day: string;
  hours: number;
}
