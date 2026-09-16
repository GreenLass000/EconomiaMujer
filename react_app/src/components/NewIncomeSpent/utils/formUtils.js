export const isFormValid = (formState) => {
    const { name, selectedType } = formState;

    if (!name) return false;

    if (selectedType === 'ingreso') {
        return !!(formState.incomeItem && formState.incomeAmount && formState.incomeAmount >= 0);
    }

    if (selectedType === 'gasto') {
        return !!(formState.spentItem && formState.spentAmount && formState.spentAmount >= 0);
    }

    return false;
};

export const prepareFormData = (formState, personList) => {
    const {
        selectedType,
        incomeItem,
        spentItem,
        incomeAmount,
        spentAmount,
        name,
        date,
        description,
        isConcerted
    } = formState;

    const person = personList.find(person => `${person.firstName} ${person.lastName}` === name);

    return {
        person_id: person.id,
        concept: selectedType === 'ingreso' ? incomeItem : spentItem,
        amount: selectedType === 'ingreso' ? incomeAmount : -Math.abs(spentAmount),
        description,
        date,
        isconcertado: isConcerted
    };
};
