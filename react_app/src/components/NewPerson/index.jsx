import React, { useState } from 'react';
import axios from '../../api';
import PersonForm from './components/PersonForm';
import './styles/newperson_styles.css';

const NewPersonModal = ({ onSubmit, onFinish }) => {
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    isConcertado: false,
  });

  const handleChange = (field, value) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/persons', formState);
      if (typeof onSubmit === 'function') onSubmit(response.data);
    } catch (error) {
      console.error('Error al añadir persona:', error);
    } finally {
      if (typeof onFinish === 'function') onFinish();

      setFormState({ firstName: '', lastName: '', isConcertado: false });
    }
  };

  return (
    <PersonForm
      formState={formState}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
};

export default NewPersonModal;
