import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import "./forms.css";

interface LoginData {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { setToken,setSubscriptions } = useContext(AuthContext);
  const [formData, setFormData] = useState<LoginData>({ username: '', password: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.success) {
        setMessage('Login successful!');
        // Handle token storage or user state after login here

        sessionStorage.setItem('username', formData.username);
        setToken(result.token);
        console.log("Token:", result.token);
        try {
          const resp = await fetch(`${apiUrl}/getSubscribedCities`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });

          const got = await resp.json();

          if(got){
            setSubscriptions(got.map((lol: { city: any; }) => lol.city));
            
          }
          
        } catch (error) {
          setMessage('Error:Unable to get the subscriptions');
        }

        navigate('/dashboard');

      } else {
        setMessage(result.message || 'Error logging in');
      }
    } catch (error) {
      setMessage('Error: Unable to log in');
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className='form-page'>
      <div className='form'>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Password:
            <div  className="password-wrapper">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label="Toggle password visibility"
                  className='pwd-visible'
                >
                  {passwordVisible ? '👁️' : '👁️‍🗨️'}
                </button>
                </div>
          </label>
          <br />
          <button className='btn' type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Login;
