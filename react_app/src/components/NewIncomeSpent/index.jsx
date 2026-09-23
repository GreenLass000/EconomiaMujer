import React from 'react';
import { Grid, Button, TextField } from '@mui/material';

import { useFormLists } from './hooks/useFormLists';
import { useFormState } from './hooks/useFormState';
import { createFormHandlers } from './handlers/formHandlers';
import { isFormValid } from './utils/formUtils';
import { defaultInitialValues } from './constants/initialValues';

import PersonSelector from './components/PersonSelector';
import TypeSelector from './components/TypeSelector';
import ItemSelector from './components/ItemSelector';
import AmountInput from './components/AmountInput';
import ConcertedCheckbox from './components/ConcertedCheckbox';
import CustomDatePicker from './components/CustomDatePicker';

import './styles/styles.css';

const NewIncomeSpentModal = ({ onSubmit, onFinish, initialValues = defaultInitialValues }) => {
    const lists = useFormLists();
    const [formState, updateFormState] = useFormState(initialValues);
    const { handleSubmit } = createFormHandlers(formState, updateFormState, lists);

    const isIncome = formState.selectedType === 'ingreso';

    return (
        <form onSubmit={(e) => handleSubmit(e, onSubmit, onFinish)}>
            <PersonSelector
                value={formState.name}
                onChange={(e) => updateFormState('name', e.target.value)}
                personList={lists.personList}
            />
            <TypeSelector
                value={formState.selectedType}
                onChange={(e) => updateFormState('selectedType', e.target.value)}
            />
            <Grid container>
                <Grid item xs={12}>
                    <ItemSelector
                        value={isIncome ? formState.incomeItem : formState.spentItem}
                        onChange={(e) =>
                            updateFormState(
                                isIncome ? 'incomeItem' : 'spentItem',
                                e.target.value
                            )
                        }
                        items={isIncome ? lists.incomeList : lists.spentList}
                        label={isIncome ? 'Lista de Ingresos' : 'Lista de Gastos'}
                        required
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <AmountInput
                        value={isIncome ? formState.incomeAmount : formState.spentAmount}
                        onChange={(e) =>
                            updateFormState(
                                isIncome ? 'incomeAmount' : 'spentAmount',
                                e.target.value
                            )
                        }
                        required
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12}>
                    <ConcertedCheckbox
                        checked={formState.isConcerted}
                        onChange={(e) => updateFormState('isConcerted', e.target.checked)}
                        disabled={isIncome}
                    />
                </Grid>
            </Grid>
            <CustomDatePicker
                value={formState.date}
                onChange={(newDate) => updateFormState('date', newDate)}
                fullWidth
            />
            <TextField
                id="description"
                name="description"
                fullWidth
                label="Descripción"
                autoComplete="off"
                variant="outlined"
                className="form-item"
                value={formState.description ?? ''}
                onChange={(e) => updateFormState('description', e.target.value)}
            />
            <Button
                type="submit"
                variant="contained"
                color="primary"
                className="form-item"
                disabled={!isFormValid(formState)}
                fullWidth
            >
                Añadir {isIncome ? 'Ingreso' : 'Gasto'}
            </Button>
        </form>
    );
};

export default NewIncomeSpentModal;
