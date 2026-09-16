import React, { lazy, Suspense, useEffect } from 'react';
import './styles/interactivelist_styles.css';
import CustomTextBox from '../CustomTextBox';
import PersonTable from './components/PersonTable';
import SnackbarAlert from './components/SnackbarAlert';
import { usePersons } from './hooks/usePersons';

const PersonDetailDialog = lazy(() => import('./components/PersonDetailDialog'));
const EditPersonDialog = lazy(() => import('./components/EditPersonDialog'));
const EditRecordDialog = lazy(() => import('./components/EditRecordDialog'));
const ConfirmDialog = lazy(() => import('./components/ConfirmDialog'));

const InteractiveList = ({ refreshKey, selectedYear }) => {
  const {
    persons,
    detailData,
    selectedRow,
    isModalOpen,
    snackbar,
    dialogs,
    editPersonData,
    editRecordData,
    setEditPersonData,
    setEditRecordData,
    handlers,
    closeSnackbar,
    formatAmount,
    fetchPersons,
    setSelectedYear
  } = usePersons();

  useEffect(() => {
    setSelectedYear(selectedYear);
    fetchPersons(selectedYear);
  }, [refreshKey, selectedYear, fetchPersons, setSelectedYear]);

  return (
    <div className="grid-item">
      <CustomTextBox text={`Gastos Personales Usuarias · ${selectedYear}`} />

      <PersonTable
        persons={persons}
        onRowClick={handlers.handleRowClick}
        formatAmount={formatAmount}
      />

      <Suspense fallback={null}>
        {isModalOpen && (
          <PersonDetailDialog
            open
            row={selectedRow}
            detailData={detailData}
            formatAmount={formatAmount}
            onClose={handlers.handleCloseModal}
            onEditPerson={handlers.handleEditPerson}
            onDisablePerson={handlers.handleDisablePersonClick}
            onDeleteRecord={handlers.handleDeleteRecordClick}
            onEditRecord={handlers.handleEditRecord}
          />
        )}
        {dialogs.editPersonDialogOpen && (
          <EditPersonDialog
            open
            data={editPersonData}
            setData={setEditPersonData}
            onClose={() => handlers.setEditPersonDialogOpen(false)}
            onSave={handlers.handleEditPersonSave}
          />
        )}
        {dialogs.editRecordDialogOpen && (
          <EditRecordDialog
            open
            data={editRecordData}
            setData={setEditRecordData}
            onClose={() => handlers.setEditRecordDialogOpen(false)}
            onSave={handlers.handleEditRecordSave}
          />
        )}
        {dialogs.deleteRecordDialogOpen && (
          <ConfirmDialog
            open
            title="¿Estás seguro?"
            content="Esta acción no se puede deshacer. Se eliminará permanentemente este registro."
            onClose={() => handlers.setDeleteRecordDialogOpen(false)}
            onConfirm={handlers.handleDeleteRecordConfirm}
          />
        )}
        {dialogs.disablePersonDialogOpen && (
          <ConfirmDialog
            open
            title="¿Estás seguro?"
            content="Esta acción no se puede deshacer. Se dará de baja a esta persona."
            onClose={() => handlers.setDisablePersonDialogOpen(false)}
            onConfirm={handlers.handleDisablePersonConfirm}
          />
        )}
      </Suspense>

      <SnackbarAlert snackbar={snackbar} onClose={closeSnackbar} />
    </div>
  );
};

export default InteractiveList;
