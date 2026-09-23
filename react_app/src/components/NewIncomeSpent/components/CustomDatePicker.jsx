import React from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const CustomDatePicker = ({ value = null, onChange }) => (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
        <DatePicker
            label="Fecha"
            value={value}
            onChange={onChange}
            format="dd/MM/yyyy"
            slotProps={{
                textField: {
                    id: 'transaction-date',
                    name: 'date',
                    autoComplete: 'off',
                    fullWidth: true,
                },
            }}
        />
    </LocalizationProvider>
);

export default CustomDatePicker;
