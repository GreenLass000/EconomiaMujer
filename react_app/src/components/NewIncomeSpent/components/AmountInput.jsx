import React from 'react';
import { TextField } from '@mui/material';

const AmountInput = ({
    value,
    onChange,
    disabled = false,
    label = "Cantidad",
    required = true,
    min = 0,
    step = "any"
}) => (
    <TextField
        id="transaction-amount"
        name="amount"
        autoComplete="off"
        fullWidth
        label={label}
        variant="outlined"
        type="number"
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{ marginTop: 16 }}
        inputProps={{ min, step }}
        required={required}
    />
);

export default AmountInput;
