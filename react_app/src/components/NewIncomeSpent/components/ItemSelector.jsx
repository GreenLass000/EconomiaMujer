import React from 'react';
import { TextField, MenuItem } from '@mui/material';

const ItemSelector = ({
    value,
    onChange,
    items,
    disabled = false,
    label,
    required = true
}) => (
    <TextField
        id="transaction-item"
        name="item"
        autoComplete="off"
        fullWidth
        select
        label={label}
        variant="outlined"
        disabled={disabled}
        value={value ?? ''}
        onChange={onChange}
        required={required}
    >
        <MenuItem value="">
            Selecciona una opción
        </MenuItem>
        {items.length > 0 ? (
            items.map((item) => (
                <MenuItem key={item.id} value={item.name}>
                    {item.name}
                </MenuItem>
            ))
        ) : (
            <MenuItem disabled>
                No hay {label.toLowerCase()} disponibles
            </MenuItem>
        )}
    </TextField>
);

export default ItemSelector;
