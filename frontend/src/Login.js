import React, { useState } from "react";
import logo from "./images/logo.svg";
import { Link } from "react-router-dom";
import Validation from "./LoginValidation";
import axios from 'axios';

/**
 * Renders the Login component.
 * 
 * @returns {JSX.Element} The rendered Login component.
 */
function Login() {
  // State variables
  const [values, setValues] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  /**
   * Handles input change event and updates the corresponding state value.
   * 
   * @param {Event} event - The input change event.
   */
  const handleInput = (event) => { 
    setValues(prev => ({...prev, [event.target.name]: event.target.value}));
  };

  /**
   * Handles form submission event and performs login.
   * 
   * @param {Event} event - The form submission event.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors(Validation(values));

    try {
      const response = await axios.post('https://gw2test-5b5b5deabf74.herokuapp.com/login', values);
      localStorage.setItem('token', response.data.token);
      window.location.href = '/account';
    } catch (error) {
      // Handle error
    }
  };

  // Render the Login component
  return (
    <div className="d-flex justify-content-center align-items-center bg-gray vh-100 vw_100">
      <div className="text-center">
        {/* Logo */}
        <img src={logo} alt="logo" className="w-100 mb-4" />

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-3 border-0">
            <input
              className="placeholderss text-danger text-center p-1 mx-auto rounded-4 border border-danger w-100"
              type="email"
              placeholder="Adresse Email"
              name='email'
              onChange={handleInput}
            />
            {errors.email && <div className='text-danger'>{errors.email}</div>}
          </div>
        
          <div className="w-100 p-3 mb-6">
            <input
              className="placeholderss text-danger text-center p-1 mx-auto rounded-4 border border-danger w-100"
              type="password"
              placeholder="Votre mot de passe"
              name='password'
              onChange={handleInput}
            />
            {errors.password && <div className='text-danger'>{errors.password}</div>}
          </div>

          <div className="d-flex align-items-center flex-column">
            <button style={{ marginTop: '3vh' }} type='submit' className="w-50 button_co d-block btn rounded-4 btn-succes text-white bg-danger text-white">
              Se connecter
            </button>

            <Link to="/signup" className="btn btn-default text-danger">
              Créer un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
