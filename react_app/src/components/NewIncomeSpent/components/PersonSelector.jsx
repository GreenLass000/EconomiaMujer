import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const PersonSelector = ({ value, onChange, personList, required = true }) => (
    <TextField
        id="transaction-person"
        name="person"
        autoComplete="off"
        fullWidth
        select
        label="Nombre"
        variant="outlined"
        value={value}
        onChange={onChange}
        required={required}
    >
        {personList.length > 0 ? (
            personList.map((person) => (
                <MenuItem key={person.id} value={`${person.firstName} ${person.lastName}`}>
                    {person.firstName} {person.lastName}
                </MenuItem>
            ))
        ) : (
            <MenuItem disabled>No hay personas disponibles</MenuItem>
        )}
    </TextField>
);

export default PersonSelector;
