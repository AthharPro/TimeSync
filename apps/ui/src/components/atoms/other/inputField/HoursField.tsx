import React, { useState, useEffect, useRef } from 'react';
import BaseTextField from './BaseTextField';
import { IHoursFieldProps } from '../../../../interfaces';


const HoursField: React.FC<IHoursFieldProps> = ({ value = 0, onChange, ...rest }) => {
  const [displayValue, setDisplayValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const formatHours = (hours: number): string => {
    const validHours = Math.max(0, Math.min(24, hours));
    const h = Math.floor(validHours);
    const m = Math.round((validHours - h) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  // Convert HH:MM format to decimal hours
  const parseHours = (input: string): number => {
    const cleaned = input.replace(/[^\d:]/g, '');
    const parts = cleaned.split(':');
    
    if (parts.length === 1) {
      const hours = parseInt(parts[0]) || 0;
      return Math.max(0, Math.min(24, hours));
    } else if (parts.length === 2) {
      const hours = parseInt(parts[0]) || 0;
      const minutes = parseInt(parts[1]) || 0;
      const totalHours = hours + minutes / 60;
      return Math.max(0, Math.min(24, totalHours));
    }
    
    return 0;
  };

  useEffect(() => {
    setDisplayValue(formatHours(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);
  };

  const handleBlur = () => {
    const parsedHours = parseHours(displayValue);
    const formatted = formatHours(parsedHours);
    setDisplayValue(formatted);
    
    if (onChange) {
      onChange(parsedHours);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Only trigger blur, do not call handleBlur directly to avoid double firing
      inputRef.current?.blur();
      return;
    }
    
    if (
      e.key === 'Backspace' ||
      e.key === 'Delete' ||
      e.key === 'Tab' ||
      e.key === 'Escape' ||
      e.key === ':' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      /^\d$/.test(e.key)
    ) {
      return;
    }
    e.preventDefault();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).select();
  };

  return (
    <BaseTextField
      type="text"
      variant="standard"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onClick={handleClick}
      inputRef={inputRef}
      placeholder="00:00"
      sx={{
        width: '44px',
        '& .MuiInput-underline:before': {
          borderBottom: 'none',
        },
        '& .MuiInput-underline:after': {
          borderBottom: 'none',
        },
        '& .MuiInput-underline:hover:not(.Mui-disabled):before': {
          borderBottom: 'none',
        },
        '& .MuiInputBase-input': {
          padding: '4px 2px',
          textAlign: 'center',
        },
        ...rest.sx,
      }}
      {...rest}
    />
  );
};

export default HoursField;