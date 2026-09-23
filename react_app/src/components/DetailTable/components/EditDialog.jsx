import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

const EditDialog = ({ open, onClose, onSave, record, onChange }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Editar Registro</DialogTitle>
    <DialogContent>
      <TextField
        id="edit-record-concept"
        label="Concepto"
        name="concept"
        autoComplete="off"
        value={record?.concept || ''}
        onChange={onChange}
        fullWidth
        margin="dense"
      />
      <TextField
        id="edit-record-description"
        label="Descripción"
        name="description"
        autoComplete="off"
        value={record?.description || ''}
        onChange={onChange}
        fullWidth
        margin="dense"
      />
      <TextField
        id="edit-record-amount"
        label="Cantidad"
        name="amount"
        type="number"
        autoComplete="off"
        value={record?.amount || ''}
        onChange={onChange}
        fullWidth
        margin="dense"
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button onClick={onSave} color="primary">Guardar</Button>
    </DialogActions>
  </Dialog>
);

export default EditDialog;
