import React, { useState } from "react";
import logo from "./images/logo.svg";
import { Link } from "react-router-dom";
import Validation from './signupValidation';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Signup() {
  // State variables to store form values and errors
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  // Hook to navigate to different routes
  const navigate = useNavigate();
  
  // State variable to store form validation errors
  const [errors, setErrors] = useState({});
  
  // Function to handle input changes in the form fields
  const handleInput = (event) => {
    setValues(prev => ({...prev, [event.target.name]: event.target.value}));
  }
  
  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Validate form values
    const newErrors = Validation(values);
    setErrors(newErrors);
    
    // If there are no validation errors, submit the form
    if(newErrors.name === "" && newErrors.email === "" && newErrors.password === ""){
      try {
        // Send a POST request to the server with form values
        const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/signup`, values);
        
        // Navigate to the home page after successful signup
        navigate('/');
      } catch (err) {
        console.log(err);
      }
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center bg-gray vh-100 v_100">
      <div className="text-center">
        {/* Logo */}
        <div className="text-center w-100 " style={{ marginBottom: '5vh' }}>
          <img className="w-100" src={logo} alt="logo" />
        </div>

        <form action="" onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="p-3 border-0 text-center">
            <input
              className="placeholderss text-danger text-center p-1 mx-auto rounded-4 border border-danger w-100"
              type="text"
              name='name'
              placeholder="Pseudo"
              onChange={handleInput}
            />
            {errors.name && <div className='text-danger'>{errors.name}</div>}
          </div>

          {/* Email Field */}
          <div className="p-3 border-0 text-center">
            <input
              className="placeholderss text-danger text-center p-1 mx-auto rounded-4 border border-danger w-100"
              type="email"
              name='email'
              placeholder="Adresse Email"
              onChange={handleInput}
            />
            {errors.email && <div className='text-danger'>{errors.email}</div>}
          </div>

          {/* Password Field */}
          <div className="w-100 p-3 mb-6 text-center">
            <input
              className="placeholderss text-danger text-center p-1 mx-auto rounded-4 border border-danger w-100"
              type="password"
              name='password'
              placeholder="Votre mot de passe"
              onChange={handleInput}
            />
            {errors.password && <div className='text-danger'>{errors.password}</div>}
          </div>
          
          {/* Submit Button */}
          <div className="d-flex align-items-center flex-column">
            <button style={{ marginTop: '3vh' }} type='submit' className="w-50 button_co d-block btn rounded-4 btn-succes text-white bg-danger text-white">
              S'enregistrer
            </button>

            <Link to="/" className="btn btn-default text-danger">
              Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;