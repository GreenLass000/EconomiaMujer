import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const PersonSelector = ({ persons, value, onChange }) => (
  <TextField
    id="report-person"
    name="personId"
    autoComplete="off"
    select
    label="Seleccionar Persona"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    fullWidth
  >
    {persons.map((p) => (
      <MenuItem key={p.id} value={p.id}>
        {p.firstName} {p.lastName}
      </MenuItem>
    ))}
  </TextField>
);

export default PersonSelector;
