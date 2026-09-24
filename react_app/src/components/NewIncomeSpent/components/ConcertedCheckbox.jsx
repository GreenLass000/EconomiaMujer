import React from 'react';
import { FormControlLabel, Checkbox } from '@mui/material';

const ConcertedCheckbox = ({ checked, onChange, disabled = false }) => (
    <FormControlLabel
        control={
            <Checkbox
                id="transaction-concerted"
                name="isConcerted"
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
