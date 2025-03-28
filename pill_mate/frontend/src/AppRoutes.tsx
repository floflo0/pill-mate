import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useUser } from './context/useUser.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Calendar from './pages/Calendar.tsx';
import CreateUser from './pages/CreateUser.tsx';

const AppRoutes: React.FC = () => {

    const { user } = useUser();

    return (
        <Routes>
            {!user ? (
                <>
                    <Route path="/create-user" element={<CreateUser />} />
                    <Route path="*" element={<Navigate to="/create-user" />} />
                </>
            ) : (
                <>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </>
            )}
        </Routes>
    );
};

export default AppRoutes;
