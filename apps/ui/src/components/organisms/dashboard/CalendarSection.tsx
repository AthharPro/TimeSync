import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Divider, IconButton } from '@mui/material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths, isSameWeek } from 'date-fns';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ICalendarEvent } from '../../../interfaces/dashboard/IDashboard';

interface ICalendarSectionProps {
  events?: ICalendarEvent[];
  onDateSelect?: (date: Date) => void;
}

const CalendarSection: React.FC<ICalendarSectionProps> = ({ events = [], onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const today = new Date();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const getEventForDate = (date: Date) => {
    return events.find(event => isSameDay(event.date, date));
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'error.main';
      case 'meeting':
        return 'info.main';
      case 'holiday':
        return 'success.main';
      case 'milestone':
        return 'warning.main';
      default:
        return 'grey.500';
    }
  };

  return (
    <Card elevation={2} sx={{ height: '100%' }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            Calendar
          </Typography>
          <Box display="flex" gap={0.5}>
            <IconButton size="small" onClick={handlePreviousMonth}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton size="small" onClick={handleToday} sx={{ mx: 0.5 }}>
              <Typography variant="caption" fontWeight={600}>
                Today
              </Typography>
            </IconButton>
            <IconButton size="small" onClick={handleNextMonth}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <Divider sx={{ my: 1 }} />
        
        <Box>
          {/* Week Days Header */}
          <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={0.3} mb={0.5}>
            {weekDays.map(day => (
              <Box key={day} textAlign="center">
                <Typography variant="caption" fontSize="0.65rem" fontWeight={600} color="text.secondary">
                  {day.slice(0, 1)}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Calendar Days */}
          <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={0.3}>
            {days.map((day, idx) => {
              const event = getEventForDate(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isTodayDate = isToday(day);
              const isCurrentWeek = isSameWeek(day, today, { weekStartsOn: 0 });
              const isSelectedDate = selectedDate && isSameDay(day, selectedDate);
              const isSelectedWeek = selectedDate && isSameWeek(day, selectedDate, { weekStartsOn: 0 });

              return (
                <Box
                  key={idx}
                  onClick={() => isCurrentMonth && handleDateClick(day)}
                  sx={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderRadius: 10,
                    backgroundColor: isTodayDate 
                      ? 'primary.main' 
                      : isSelectedDate
                      ? 'secondary.main'
                      : (isSelectedWeek || isCurrentWeek) && isCurrentMonth
                      ? 'primary.lighter'
                      : 'transparent',
                    color: isTodayDate || isSelectedDate
                      ? 'white' 
                      : isCurrentMonth 
                      ? 'text.primary' 
                      : 'text.disabled',
                    fontWeight: isTodayDate || isSelectedDate ? 600 : (isSelectedWeek || isCurrentWeek) ? 500 : 400,
                    cursor: isCurrentMonth ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    border: (isSelectedWeek || isCurrentWeek) && isCurrentMonth ? '1px solid' : 'none',
                    borderColor: isSelectedDate ? 'secondary.dark' : (isSelectedWeek || isCurrentWeek) && isCurrentMonth ? 'primary.light' : 'transparent',
                    '&:hover': {
                      backgroundColor: isTodayDate 
                        ? 'primary.dark' 
                        : isSelectedDate
                        ? 'secondary.dark'
                        : isCurrentMonth
                        ? 'action.hover'
                        : 'transparent',
                    },
                  }}
                >
                  <Typography variant="caption" fontSize="0.7rem">
                    {format(day, 'd')}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          {/* Legend */}
          
        </Box>
      </CardContent>
    </Card>
  );
};

export default CalendarSection;
