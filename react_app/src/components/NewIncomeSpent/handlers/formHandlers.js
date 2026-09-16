import axios from '../../../api';
import { isFormValid, prepareFormData } from '../utils/formUtils';

export const createFormHandlers = (formState, updateFormState, lists) => {
    const handleSpentItemChange = (event) => {
        const selectedSpent = lists.spentList.find(spent => spent.name === event.target.value);
        updateFormState('spentItem', event.target.value);
        if (selectedSpent) {
            updateFormState('isConcerted', selectedSpent.isconcertado === 1);
        }
    };

    const handleSubmit = async (e, onSubmit, onFinish) => {
        e.preventDefault();

        if (!isFormValid(formState)) {
            alert('Por favor complete todos los campos obligatorios.');
            return;
        }

        const formData = prepareFormData(formState, lists.personList);

        try {
            await axios.post('/record', formData);
            onSubmit(formData);
            if (typeof onFinish === 'function') {
                onFinish();
            }
        } catch (error) {
            console.error('Error al añadir el registro:', error);
            alert('Hubo un error al añadir el registro. Por favor, inténtelo de nuevo.');
        }
    };

    return {
        handleSpentItemChange,
        handleSubmit,
    };
};
