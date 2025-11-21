import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Divider, IconButton } from '@mui/material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, addMonths, subMonths } from 'date-fns';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { ICalendarEvent } from '../../../interfaces/dashboard/IDashboard';

interface ICalendarSectionProps {
  events?: ICalendarEvent[];
}

const CalendarSection: React.FC<ICalendarSectionProps> = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

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

              return (
                <Box
                  key={idx}
                  sx={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderRadius: 0.5,
                    backgroundColor: isTodayDate ? 'primary.main' : 'transparent',
                    color: isTodayDate ? 'white' : isCurrentMonth ? 'text.primary' : 'text.disabled',
                    fontWeight: isTodayDate ? 600 : 400,
                    cursor: event ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: isTodayDate ? 'primary.dark' : event ? 'action.hover' : 'transparent',
                    },
                  }}
                >
                  <Typography variant="caption" fontSize="0.7rem">
                    {format(day, 'd')}
                  </Typography>
                  {event && !isTodayDate && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 1,
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        backgroundColor: getEventColor(event.type),
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Legend */}
          {events.length > 0 && (
            <Box mt={1.5}>
              <Divider sx={{ mb: 0.5 }} />
              <Typography variant="caption" fontSize="0.65rem" color="text.secondary" fontWeight={600}>
                Upcoming Events
              </Typography>
              <Box mt={0.5}>
                {events.slice(0, 2).map((event, idx) => (
                  <Box key={idx} display="flex" alignItems="center" gap={0.5} mb={0.3}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: getEventColor(event.type),
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="caption" fontSize="0.65rem" noWrap>
                      {format(event.date, 'MMM d')} - {event.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CalendarSection;
