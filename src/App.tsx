import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; // Example protected component
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './components/HomePage';
import AllCities from './components/dashboardComponents/AllCities';
import SpecificCity from './components/dashboardComponents/SpecificCity';
import Statistics from './components/dashboardComponents/Statistics';
import PlotCentroids from './PlotCentroids';


const App: React.FC = () => {
  return (
    <Router>
      <div>
        <Routes>
          {/* Public Routes */}
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path='/centroids' element={<PlotCentroids />} />

          {/* Protected Route */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/allCities" element={<AllCities />} />
            <Route path="/dashboard/:city" element={< SpecificCity/>} />
            <Route path="/dashboard/statistics" element={<Statistics/>}/>
          </Route>

          {/* Home Route */}
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
