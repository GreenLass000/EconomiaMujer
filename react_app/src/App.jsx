import React, { useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import './App.css';

import theme from './theme.js';
import DetailTable from './components/DetailTable';
import InteractiveList from './components/Interactivelist';
import ResponsiveAppBar from './components/AppBar';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const refetchData = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <ResponsiveAppBar
          onRefresh={refetchData}
          currentYear={currentYear}
          selectedYear={selectedYear}
          onYearSelect={setSelectedYear}
        />
        <div className="container">
          <InteractiveList refreshKey={refreshKey} selectedYear={selectedYear} />
          <DetailTable refreshKey={refreshKey} selectedYear={selectedYear} />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
