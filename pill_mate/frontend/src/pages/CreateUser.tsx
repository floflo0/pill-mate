import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/useUser';
import { UserRole } from '../models/UserRole';
import './CreateUser.css';

const CreateUser = () => {
    const { createUser } = useUser();
    const [role] = useState(UserRole.HELPED);
    const navigate = useNavigate();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await createUser(role);
        navigate('/dashboard');
    };

    return (
        <div className="CreateUser">
            <div className="title">Bienvenue sur PillMate</div>
            <form className="questionnaire" onSubmit={handleSubmit}>
                <h2>Quel est votre rôle ?</h2>
                <select name="role">
                    <option value={UserRole.HELPED}>Personne aidée</option>
                    <option value={UserRole.HELPER}>Personne aidante</option>
                </select>
                <button type="submit">Valider</button>
            </form>
        </div>
    );
};

export default CreateUser;
