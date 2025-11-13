import React from 'react';
import BaseTextField from './BaseTextField';
import { INumberFieldProps } from '../../../../interfaces/component';

const NumberField = React.forwardRef<HTMLInputElement, INumberFieldProps>(
  ({ onChange, onKeyDown, type = 'int', maxDigits, ...rest }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      let formattedValue = value;

      if (type === 'int') {
        formattedValue = value.replace(/[^0-9]/g, '');
        if (typeof maxDigits === 'number' && maxDigits > 0) {
          formattedValue = formattedValue.slice(0, maxDigits);
        }
      } else if (type === 'float' || type === 'decimal') {
        formattedValue = value.replace(/[^0-9.]/g, '');
        const parts = formattedValue.split('.');
        if (parts.length > 2) {
          formattedValue = parts[0] + '.' + parts.slice(1).join('');
        }
        if (typeof maxDigits === 'number' && maxDigits > 0) {
          const digitsOnly = formattedValue.replace(/\./g, '');
          const truncatedDigits = digitsOnly.slice(0, maxDigits);
          // Reconstruct with at most one dot, preserving first dot position if present
          if (formattedValue.includes('.')) {
            const firstDotIndex = formattedValue.indexOf('.');
            const digitsBeforeDot = Math.min(firstDotIndex, truncatedDigits.length);
            const before = truncatedDigits.slice(0, digitsBeforeDot);
            const after = truncatedDigits.slice(digitsBeforeDot);
            formattedValue = after.length > 0 ? `${before}.${after}` : before;
          } else {
            formattedValue = truncatedDigits;
          }
        }
      }

      e.target.value = formattedValue;

      if (onChange) {
        onChange(e);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <BaseTextField
        {...rest}
        ref={ref}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    );
  }
);

export default NumberField;