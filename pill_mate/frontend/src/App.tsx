import { FC } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import './App.css';
import AppRoutes from './AppRoutes.tsx';
import { ReminderProvider } from './context/ReminderContext.tsx';

const App: FC = () => {
    return (
        <ReminderProvider>
            <Router>
                <AppRoutes />
            </Router>
        </ReminderProvider>
    );
};

export default App;
