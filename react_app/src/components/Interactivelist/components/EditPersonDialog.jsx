import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button
} from '@mui/material';

const EditPersonDialog = ({ open, data, setData, onClose, onSave }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Editar Persona</DialogTitle>
    <DialogContent>
      <TextField
        id="edit-person-first-name"
        name="firstName"
        autoComplete="given-name"
        fullWidth
        label="Nombre"
        value={data.firstName}
        onChange={(e) => setData({ ...data, firstName: e.target.value })}
        margin="normal"
      />
      <TextField
        id="edit-person-last-name"
        name="lastName"
        autoComplete="family-name"
        fullWidth
        label="Apellidos"
        value={data.lastName}
        onChange={(e) => setData({ ...data, lastName: e.target.value })}
        margin="normal"
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button onClick={onSave} variant="contained" color="primary">Guardar</Button>
    </DialogActions>
  </Dialog>
);

export default EditPersonDialog;
