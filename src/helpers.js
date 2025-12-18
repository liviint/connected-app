export const validateEmail = (email) => {
    let errorMessage = "";

    if (!email.trim()) {
        errorMessage = "Please enter your email.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        errorMessage = "Please enter a valid email address.";
    }

    const isValid = errorMessage === "";

    return { isValid, errorMessage };
};