import React from "react";
import ProtectedRoute from "./ProtectedRoute";
import { useNavigate } from "react-router-dom";
import IMAGES from '../images/images';


const HomePage : React.FC = ()  => {

    const navigate = useNavigate();

    const goToLogin = () => {
        navigate('/login');
    };

    const goToSignUp = () => {
        navigate('/sign-up');
    }

    return(
        <div className="home-page">
            <div className="home">
                <h1>Notification System for Air Quality</h1>
                <button type="button" onClick={goToLogin}>Login</button> 
                <p onClick={goToSignUp}>Sign up</p>
            </div>
        </div>
    );
};

export default HomePage;