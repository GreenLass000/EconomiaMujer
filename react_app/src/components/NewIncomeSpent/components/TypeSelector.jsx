import React from 'react';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const TypeSelector = ({ value, onChange, options = [
    { value: 'ingreso', label: 'Ingreso' },
    { value: 'gasto', label: 'Gasto' }
] }) => (
    <FormControl component="fieldset" style={{ marginTop: 16 }}>
        <FormLabel component="legend">Tipo</FormLabel>
        <RadioGroup
            row
            name="type"
            value={value}
            onChange={onChange}
        >
            {options.map(option => (
                <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                />
            ))}
        </RadioGroup>
    </FormControl>
);

export default TypeSelector;
