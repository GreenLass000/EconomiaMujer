import React, { lazy, Suspense, useState } from 'react';
import axios from '../../api';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import './menu_styles.css';

const AddPersonDialog = lazy(() => import('./components/AddPersonDialog'));
const NewIncomeSpentDialog = lazy(() => import('./components/NewIncomeSpentDialog'));
const GenerateReportDialog = lazy(() => import('./components/GenerateReportDialog'));

const ResponsiveAppBar = ({ onRefresh, currentYear, selectedYear, onYearSelect }) => {
    const [selectedDialog, setSelectedDialog] = useState(null);
    const [historyAnchor, setHistoryAnchor] = useState(null);
    const [availableYears, setAvailableYears] = useState([]);
    const [historyError, setHistoryError] = useState(false);

    const handleItemClick = (index) => {
        setSelectedDialog(index);
    };

    const handleClose = () => {
        setSelectedDialog(null);
    };

    const handleNewPersonFormSubmit = (formData) => {
        handleClose();
    };

    const handleNewIncomeSpentFormSubmit = (formData) => {
        // Puedes hacer algo con formData si quieres
    };

    const handleNewIncomeSpentFinish = () => {
        if (typeof onRefresh === 'function') {
            onRefresh();
        }
        handleClose();
    };

    const handleHistoryOpen = async (event) => {
        setHistoryAnchor(event.currentTarget);
        setHistoryError(false);
        try {
            const response = await axios.get('/record/years');
            setAvailableYears(response.data.filter(year => year < currentYear));
        } catch (error) {
            console.error('Error al cargar el historial:', error);
            setAvailableYears([]);
            setHistoryError(true);
        }
    };

    const handleYearSelect = (year) => {
        onYearSelect(year);
        setHistoryAnchor(null);
    };

    return (
        <>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Economía Comunidad Terapéutica · {selectedYear}
                    </Typography>
                    <Button color="inherit" onClick={() => handleItemClick(0)}>Añadir Persona</Button>
                    <Button color="inherit" onClick={() => handleItemClick(1)}>Nuevo Ingreso/Gasto</Button>
                    <Button color="inherit" onClick={() => handleItemClick(2)}>Generar Reporte</Button>
                    <Button
                        color="inherit"
                        aria-controls={historyAnchor ? 'history-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={historyAnchor ? 'true' : undefined}
                        onClick={handleHistoryOpen}
                    >
                        Historial
                    </Button>
                </Toolbar>
            </AppBar>

            <Menu
                id="history-menu"
                anchorEl={historyAnchor}
                open={Boolean(historyAnchor)}
                onClose={() => setHistoryAnchor(null)}
            >
                {historyError ? (
                    <MenuItem disabled>No se pudo cargar el historial. Inténtalo de nuevo.</MenuItem>
                ) : availableYears.length === 0 ? (
                    <MenuItem disabled>No hay años anteriores con movimientos</MenuItem>
                ) : availableYears.map(year => (
                    <MenuItem key={year} selected={year === selectedYear} onClick={() => handleYearSelect(year)}>
                        <ListItemText primary={year} secondary="Ver detalles del año" />
                    </MenuItem>
                ))}
                {selectedYear !== currentYear && (
                    <MenuItem onClick={() => handleYearSelect(currentYear)}>
                        <ListItemText primary={`Volver a ${currentYear}`} />
                    </MenuItem>
                )}
            </Menu>

            <Suspense fallback={null}>
                {selectedDialog === 0 && (
                    <AddPersonDialog
                        open
                        onClose={handleClose}
                        onSubmit={handleNewPersonFormSubmit}
                        onFinish={() => {
                            onRefresh();
                            handleClose();
                        }}
                    />
                )}
                {selectedDialog === 1 && (
                    <NewIncomeSpentDialog
                        open
                        onClose={handleClose}
                        onSubmit={handleNewIncomeSpentFormSubmit}
                        onFinish={handleNewIncomeSpentFinish}
                    />
                )}
                {selectedDialog === 2 && <GenerateReportDialog open onClose={handleClose} />}
            </Suspense>
        </>
    );
};

export default ResponsiveAppBar;
