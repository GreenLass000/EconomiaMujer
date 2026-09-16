import React, { lazy, Suspense, useEffect, useState } from 'react';
import axios from '../../api';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import './detailtable_styles.css';
import CustomTextBox from '../CustomTextBox';
import FeedbackSnackbar from './components/FeedbackSnackbar';
import TableBodyContent from './components/TableBodyContent';
import { GridItem } from './styles';

const DeleteDialog = lazy(() => import('./components/DeleteDialog'));
const EditDialog = lazy(() => import('./components/EditDialog'));

const DetailTable = ({ refreshKey, selectedYear }) => {
  const [detailData, setDetailData] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [selectedId, setSelectedId] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/record/person/1', { params: { year: selectedYear } });
        setDetailData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [refreshKey, selectedYear]);

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/record/${selectedId}`);
      setDetailData(detailData.filter(row => row.id !== selectedId));
      setSnackbar({ open: true, message: 'Registro eliminado correctamente', severity: 'success' });
    } catch (error) {
      console.error('Error deleting record:', error);
      setSnackbar({ open: true, message: 'Error al eliminar el registro', severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleEdit = (row) => {
    setEditingRecord({ ...row });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      await axios.put(`/record/${editingRecord.id}`, editingRecord);
      setDetailData(detailData.map(item => (item.id === editingRecord.id ? editingRecord : item)));
      setSnackbar({ open: true, message: 'Registro actualizado correctamente', severity: 'success' });
    } catch (error) {
      console.error('Error updating record:', error);
      setSnackbar({ open: true, message: 'Error al actualizar el registro', severity: 'error' });
    } finally {
      setEditDialogOpen(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <GridItem>
      <CustomTextBox text={`Caja Programa Mujer · ${selectedYear}`} />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 'bold' }}>Fecha</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Concepto</TableCell>
              <TableCell style={{ fontWeight: 'bold' }}>Descripción</TableCell>
              <TableCell style={{ fontWeight: 'bold' }} align="right">Cantidad</TableCell>
              <TableCell style={{ fontWeight: 'bold' }} align="right">Total acumulado</TableCell>
              <TableCell style={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableBodyContent
              data={detailData}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </TableBody>
        </Table>
      </TableContainer>

      <Suspense fallback={null}>
        {deleteDialogOpen && (
          <DeleteDialog
            open
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleDeleteConfirm}
          />
        )}
        {editDialogOpen && (
          <EditDialog
            open
            onClose={() => setEditDialogOpen(false)}
            onSave={handleEditSave}
            record={editingRecord}
            onChange={handleInputChange}
          />
        )}
      </Suspense>

      <FeedbackSnackbar
        snackbar={snackbar}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />
    </GridItem>
  );
};

export default DetailTable;
