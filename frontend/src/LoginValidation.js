function Validation(values){
    
    // Create an empty object to store error messages
    let error = {
    }

    // Define regular expressions for email and password patterns
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const password_pattern =  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/

    // Check if the email field is empty
    if(values.email === "") {
        error.email = "Le champ ne doit pas être vide"
    }
    // Check if the email format is valid using the email pattern regular expression
    else if(!email_pattern.test(values.email)){
        error.email ="Le mail ne correspond pas"
    }
    else{
        // If the email is valid, set the error message to an empty string
        error.email= ""
    }

    // Check if the password field is empty
    if(values.password === ""){
        error.password= "Le champ du mot de passe ne doit pas être vide"
    }
    // Check if the password format is valid using the password pattern regular expression
    else if(!password_pattern.test(values.password)){
        error.password = "le mot de passe ne correspond pas"
    } 
    else {
        // If the password is valid, set the error message to an empty string
        error.password = ""
    }

    // Return the error object containing any error messages
    return error;
}

// Export the Validation function as the default export of the module
export default Validation;