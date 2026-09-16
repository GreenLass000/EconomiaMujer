import { useState } from 'react';

export const useFormState = (initialValues) => {
    const [formState, setFormState] = useState({
        date: initialValues.date ?? new Date(),
        selectedType: initialValues.type,
        isConcerted: initialValues.isConcerted,
        description: initialValues.description,
        incomeItem: initialValues.incomeItem,
        spentItem: initialValues.spentItem,
        name: initialValues.name,
        incomeAmount: initialValues.incomeAmount,
        spentAmount: initialValues.spentAmount
    });

    const updateFormState = (field, value) => {
        setFormState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return [formState, updateFormState];
};
