import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "./forms.css";

interface SignUpData {
  username: string;
  password: string;
}

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState<SignUpData>({ username: '', password: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);  // Track if sign-up was successful
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isLongEnough: false,
  });
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;

  const validatePassword = (password: string) => {
    const validations = {
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*]/.test(password),
      isLongEnough: password.length >= 8,
    };
    setPasswordValidations(validations);
    return Object.values(validations).every(Boolean); // Checks if all validations are true
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(formData.password)) {
      setMessage("Password does not meet the required criteria.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/sign-up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const payload = await response.json();

      if (payload.success) {
        // If the sign-up is successful, set the success flag to true
        setSignUpSuccess(true);
      } else {
        // alert('Sign-up failed. Please try again.');
        setMessage('Sign up failed. The username already exists. Please try again!')
      }
    } catch (error) {
      setMessage('Error: Unable to sign up');
    }

  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className='form-page'>
      <div className='form'>
        <h2>Sign Up</h2>
        {signUpSuccess ? (
          // Show the clickable message if the sign-up was successful
          <div>
            <p>Sign-up successful! <Link to="/login">Click here to log in</Link></p>
          </div>
        ) : (
          // Show the sign-up form if the sign-up is not successful yet
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
          <div>
              <p>Password must include:</p>
              <ul>
                <li style={{ color: passwordValidations.hasUppercase ? 'green' : 'red' }}>
                  An uppercase letter
                </li>
                <li style={{ color: passwordValidations.hasNumber ? 'green' : 'red' }}>
                  A number
                </li>
                <li style={{ color: passwordValidations.hasSpecialChar ? 'green' : 'red' }}>
                  A special character (e.g., !@#$%^&*)
                </li>
                <li style={{ color: passwordValidations.isLongEnough ? 'green' : 'red' }}>
                  At least 8 characters
                </li>
              </ul>
            </div>
          <br />
          <button className='btn' type="submit">Sign Up</button>
        </form>
        )}
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default SignUp;
