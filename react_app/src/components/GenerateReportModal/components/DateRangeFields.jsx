import React from 'react';
import { TextField } from '@mui/material';

const DateRangeFields = ({ startDate, endDate, onStartChange, onEndChange }) => (
  <>
    <TextField
      id="report-start-date"
      name="startDate"
      label="Fecha Inicio"
      type="date"
      autoComplete="off"
      value={startDate}
      onChange={(e) => onStartChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      fullWidth
    />

    <TextField
      id="report-end-date"
      name="endDate"
      label="Fecha Fin"
      type="date"
      autoComplete="off"
      value={endDate}
      onChange={(e) => onEndChange(e.target.value)}
      InputLabelProps={{ shrink: true }}
      fullWidth
    />
  </>
);

export default DateRangeFields;
