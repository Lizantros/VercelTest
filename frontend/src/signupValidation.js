function Validation(values){
    
    let error = {
    }
    const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d"@$!%*?&]{8,}$/;

    // Check if the 'name' field is empty
    if(values.name === "") {
        error.name = "Le champ ne doit pas être vide" // Set an error message if it is empty
    } else {
        error.name= "" // Clear the error message if it is not empty
    }

    // Check if the 'email' field is empty
    if(values.email === "") {
        error.email = "Le champ ne doit pas être vide" // Set an error message if it is empty
    } else if(!email_pattern.test(values.email)){
        error.email ="Le mail ne correspond pas" // Set an error message if the email format is invalid
    } else {
        error.email= "" // Clear the error message if it is not empty and the format is valid
    }

    // Check if the 'password' field is empty
    if(values.password === ""){
        error.password= "Le champ du mot de passe ne doit pas être vide" // Set an error message if it is empty
    } else if(!password_pattern.test(values.password)){
        error.password = "une minuscule / une majuscule / un chiffre / 8 caractères minimum / 1 caractère spécial" // Set an error message if the password format is invalid
    } else {
        error.password = "" // Clear the error message if it is not empty and the format is valid
    }
    console.log(error); // Log the error object to the console for debugging purposes
    return error; // Return the error object
}

export default Validation; // Export the Validation function as the default export of the module