import { useState, useCallback } from 'react';
import axios from '../../../api';

export const usePersons = () => {
  const [persons, setPersons] = useState([]);
  const [detailData, setDetailData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPersonDialogOpen, setEditPersonDialogOpen] = useState(false);
  const [editRecordDialogOpen, setEditRecordDialogOpen] = useState(false);
  const [deleteRecordDialogOpen, setDeleteRecordDialogOpen] = useState(false);
  const [disablePersonDialogOpen, setDisablePersonDialogOpen] = useState(false);

  const [editPersonData, setEditPersonData] = useState({ firstName: '', lastName: '' });
  const [editRecordData, setEditRecordData] = useState({});

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const formatAmount = (amount) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  const closeSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const fetchPersonBalance = async (personId, year) => {
    try {
      const response = await axios.get(`/record/person/${personId}`, { params: { year } });
      const records = response.data;
      return records.reduce((total, r) => total + r.amount, 0);
    } catch {
      return 0;
    }
  };

  const fetchPersons = useCallback(async (year) => {
    try {
      const response = await axios.get('/persons/active');
      const withBalances = await Promise.all(response.data.map(async (p) => {
        const balance = await fetchPersonBalance(p.id, year);
        return {
          ...p,
          name: `${p.lastName}, ${p.firstName}`,
          balance,
        };
      }));

      setPersons(
        withBalances.filter(p =>
          !(p.firstName.toLowerCase() === 'programa' && p.lastName.toLowerCase() === 'mujer')
        )
      );
    } catch (err) {
      console.error('Error fetching persons:', err);
    }
  }, []);

  const handleRowClick = async (row) => {
    setSelectedRow(row);
    setSelectedId(row.id);
    try {
      const res = await axios.get(`/record/person/${row.id}`, { params: { year: selectedYear } });
      setDetailData(res.data);
    } catch (err) {
      console.error('Error fetching person detail:', err);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
    setDetailData([]);
  };

  const handleDisablePersonClick = () => {
    setDisablePersonDialogOpen(true);
  };

  const handleDisablePersonConfirm = async () => {
    try {
      await axios.patch(`/person/delete/${selectedRow.id}`);
      setSnackbar({ open: true, message: 'Persona dada de baja exitosamente.', severity: 'success' });
      setDisablePersonDialogOpen(false);
      setIsModalOpen(false);
      fetchPersons(selectedYear);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al dar de baja.', severity: 'error' });
    }
  };

  const handleDeleteRecordClick = (id) => {
    setSelectedId(id);
    setDeleteRecordDialogOpen(true);
  };

  const handleDeleteRecordConfirm = async () => {
    try {
      await axios.delete(`/record/${selectedId}`);
      setDetailData(prev => prev.filter(item => item.id !== selectedId));
      setSnackbar({ open: true, message: 'Registro eliminado.', severity: 'success' });
      setDeleteRecordDialogOpen(false);
    } catch {
      setSnackbar({ open: true, message: 'Error al eliminar.', severity: 'error' });
    }
  };

  const handleEditRecord = (row) => {
    setSelectedId(row.id);
    setEditRecordData(row);
    setEditRecordDialogOpen(true);
  };

  const handleEditRecordSave = async () => {
    try {
      await axios.put(`/record/${selectedId}`, editRecordData);
      setDetailData(prev => prev.map(r => r.id === editRecordData.id ? editRecordData : r));
      setSnackbar({ open: true, message: 'Registro editado.', severity: 'success' });
      setEditRecordDialogOpen(false);
    } catch {
      setSnackbar({ open: true, message: 'Error al editar.', severity: 'error' });
    }
  };

  const handleEditPerson = () => {
    setEditPersonData({
      firstName: selectedRow.firstName,
      lastName: selectedRow.lastName,
    });
    setEditPersonDialogOpen(true);
  };

  const handleEditPersonSave = async () => {
    try {
      await axios.put(`/person/${selectedRow.id}`, editPersonData);
      setSnackbar({ open: true, message: 'Persona editada.', severity: 'success' });
      setEditPersonDialogOpen(false);
      setIsModalOpen(false);
      fetchPersons(selectedYear);
    } catch {
      setSnackbar({ open: true, message: 'Error al editar persona.', severity: 'error' });
    }
  };

  return {
    persons,
    detailData,
    selectedRow,
    isModalOpen,
    snackbar,
    dialogs: {
      editPersonDialogOpen,
      editRecordDialogOpen,
      deleteRecordDialogOpen,
      disablePersonDialogOpen,
    },
    editPersonData,
    editRecordData,
    setEditPersonData,
    setEditRecordData,
    closeSnackbar,
    formatAmount,
    fetchPersons,
    setSelectedYear,
    handlers: {
      handleRowClick,
      handleCloseModal,
      handleDisablePersonClick,
      handleDisablePersonConfirm,
      handleDeleteRecordClick,
      handleDeleteRecordConfirm,
      handleEditRecord,
      handleEditRecordSave,
      handleEditPerson,
      handleEditPersonSave,
      setEditPersonDialogOpen,
      setEditRecordDialogOpen,
      setDeleteRecordDialogOpen,
      setDisablePersonDialogOpen,
    }
  };
};
