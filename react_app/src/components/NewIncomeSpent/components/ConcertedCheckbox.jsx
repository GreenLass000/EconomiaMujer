import React from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';

const ConcertedCheckbox = ({ checked, onChange, disabled = false }) => (
    <FormControlLabel
        control={
            <Checkbox
                checked={checked}
                onChange={onChange}
                disabled={disabled}
            />
        }
        label="Gasto concertado"
        style={{ marginTop: 16 }}
    />
);

export default ConcertedCheckbox;
