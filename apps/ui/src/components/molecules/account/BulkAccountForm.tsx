import React, { useState, useRef } from 'react'; 
import { Box, Typography, Divider } from '@mui/material'; 
import BaseBtn from '../../atoms/other/button/BaseBtn'; 
import HelperText from '../../atoms/other/text/HelperText'; 
import { IBulkAccountFormProps } from '../../../interfaces/component/IBulkAccountForm'; 
import * as XLSX from 'xlsx';


const BulkAccountForm: React.FC<IBulkAccountFormProps> = ({ 
  isLoading = false, onSubmit, onReset, 
}) => {
  const [file, setFile] = useState<File | null>(null); 
  const [rows, setRows] = useState<any[]>([]); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event:
    React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer); 
          const workbook = XLSX.read(data, { type: 'array' }); 
          const firstSheetName = workbook.SheetNames[0]; 
          const worksheet = workbook.Sheets[firstSheetName]; 
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

        
          const formattedData = jsonData.map((row: any) => {
            const contactNumber = row.contactNumber || row['Contact Number'];
            if (contactNumber !== undefined && contactNumber !== null) {
             
              let formatted = String(contactNumber).replace(/[^0-9]/g, '');
             
              if (formatted.length > 0 && formatted.length <= 10) {
                formatted = formatted.padStart(10, '0');
              }
              return {
                ...row,
                contactNumber: formatted,
                'Contact Number': formatted,
              };
            }
            return row;
          });

          setRows(formattedData);
          if (onReset) {
            onReset(); 
          }
          } catch (error) {
            console.error('Error reading file:', error);
            setRows([]);
          }
        };
        reader.readAsArrayBuffer(selectedFile); 
      };

      const handleSubmit = () => {
        if (rows.length > 0 && onSubmit) {
          onSubmit(rows);
        }
      };

      const handleReset = () => {
        setFile(null); 
        setRows([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (onReset) {
          onReset();
        }
      };

      return ( 
      <Box sx={{ display: 'flex', flexDirection: 'column', padding: 2, gap: 2, }} >
        <HelperText variant="body2" align="left" sx={{ py: 0 }}>
          Upload an Excel file (.xlsx) with columns: Email, First Name, Last Name, Designation, Contact Number
        </HelperText>

        <Box>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} disabled={isLoading} style={{ display: 'none' }} id="bulk-account-file-input" />
          <label htmlFor="bulk-account-file-input">
            <BaseBtn component="span" variant="outlined" disabled={isLoading} sx={{ width: '100%' }} > 
            {file ? file.name : 'Choose File'} 
            </BaseBtn>
          </label>
        </Box>

        {rows.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {rows.length} account(s) found in file
            </Typography>
          </Box>
        )}

        <Box> 
          <Divider /> 
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'flex-end', }} >
          <BaseBtn type="button" onClick={handleReset} variant="outlined" disabled={isLoading} >
            Reset
          </BaseBtn>
          <BaseBtn type="button" onClick={handleSubmit} disabled={rows.length === 0 || isLoading} >
            {isLoading ? 'Creating...' : `Create ${rows.length} Account(s)`}
          </BaseBtn>
        </Box>
      </Box>
    );
  }

  export default BulkAccountForm;
        