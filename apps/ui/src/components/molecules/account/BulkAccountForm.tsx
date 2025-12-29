import React, { useState, useRef } from 'react';
import { Box, Typography, Divider, Alert } from '@mui/material';
import BaseBtn from '../../atoms/other/button/BaseBtn';
import HelperText from '../../atoms/other/text/HelperText';
import { IBulkAccountFormProps } from '../../../interfaces/component/IBulkAccountForm';
import * as XLSX from 'xlsx';

interface BulkUserRow {
  [key: string]: any;
}

interface ValidationError {
  rowIndex: number;
  missingFields: string[];
}

const BulkAccountForm: React.FC<IBulkAccountFormProps> = ({
  isLoading = false,
  onSubmit,
  onReset,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<BulkUserRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const REQUIRED_FIELDS = ['Email', 'First Name', 'Last Name', 'Designation', 'Contact Number'];

  const validateRows = (data: BulkUserRow[]): ValidationError[] => {
    const errors: ValidationError[] = [];

    data.forEach((row, index) => {
      const missingFields: string[] = [];

      REQUIRED_FIELDS.forEach(field => {
        const value = row[field];
        if (!value || String(value).trim() === '') {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        errors.push({
          rowIndex: index + 2, // +2 because Excel rows start at 1 and row 1 is the header
          missingFields,
        });
      }
    });

    return errors;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: BulkUserRow[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
      });
      
      console.log('Excel Data:', jsonData);
      console.log('Number of rows:', jsonData.length);
      console.log('Fields:', jsonData && jsonData.length ? Object.keys(jsonData[0]) : []);
      
      // Validate the rows
      const errors = validateRows(jsonData);
      setValidationErrors(errors);
      
      setRows(jsonData);
      
      if (onReset) {
        onReset();
      }
    } catch (error) {
      console.error('Error reading file:', error);
      setRows([]);
      setValidationErrors([]);
    }
  };

  const handleSubmit = () => {
    if (rows.length > 0 && validationErrors.length === 0 && onSubmit) {
      onSubmit(rows);
    }
  };

  const handleReset = () => {
    setFile(null);
    setRows([]);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onReset) {
      onReset();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        padding: 2,
        gap: 2,
      }}
    >
      <HelperText variant="body2" align="left" sx={{ py: 0 }}>
        Upload an Excel file (.xlsx) with columns: Email, First Name, Last Name, Designation, Contact Number
      </HelperText>

      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isLoading}
            style={{ display: 'none' }}
            id="bulk-account-file-input"
          />
          <label htmlFor="bulk-account-file-input">
            <BaseBtn
              component="span"
              variant="outlined"
              disabled={isLoading}
            >
              Upload file
            </BaseBtn>
          </label>
        </Box>

        {file && (
          <Typography variant="body2" color="text.secondary">
            {file.name}
          </Typography>
        )}
      </Box>

      {rows.length > 0 && (
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {rows.length} account(s) found in file
          </Typography>
        </Box>
      )}

      {validationErrors.length > 0 && (
        <Alert severity="error" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Found {validationErrors.length} row(s) with missing data:
          </Typography>
          {validationErrors.slice(0, 5).map((error, index) => (
            <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
              • Row {error.rowIndex}: Missing {error.missingFields.join(', ')}
            </Typography>
          ))}
          {validationErrors.length > 5 && (
            <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
              ... and {validationErrors.length - 5} more error(s)
            </Typography>
          )}
        </Alert>
      )}

      <Box>
        <Divider />
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          justifyContent: 'flex-end',
        }}
      >
        <BaseBtn
          type="button"
          onClick={handleReset}
          variant="outlined"
          disabled={isLoading}
        >
          Reset
        </BaseBtn>
        <BaseBtn
          type="button"
          onClick={handleSubmit}
          disabled={rows.length === 0 || validationErrors.length > 0 || isLoading}
        >
          {isLoading ? 'Creating...' : `Create ${rows.length} Account(s)`}
        </BaseBtn>
      </Box>
    </Box>
  );
};

export default BulkAccountForm;
