document.addEventListener("DOMContentLoaded", function () {
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const messageBox = document.getElementById("message-box");

    // Handle tab switching
    loginTab.addEventListener("click", function () {
        loginForm.style.display = "block";
        registerForm.style.display = "none";
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
    });

    registerTab.addEventListener("click", function () {
        loginForm.style.display = "none";
        registerForm.style.display = "block";
        registerTab.classList.add("active");
        loginTab.classList.remove("active");
    });

    // Handle form submission
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
        if (!validateEmail(email) || password.length < 6) {
            displayMessage("Invalid email or password must be at least 6 characters.", "error");
            return;
        }

        // Simulate login request (replace with actual API call)
        displayMessage("Logging in...", "info");
        setTimeout(() => {
            displayMessage("Login successful! Redirecting...", "success");
            window.location.href = "../dashboard.html"; // Redirect on success
        }, 2000);
    });

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        
        if (!validateEmail(email) || password.length < 6 || password !== confirmPassword) {
            displayMessage("Invalid email or passwords do not match.", "error");
            return;
        }

        // Simulate registration request (replace with actual API call)
        displayMessage("Registering...", "info");
        setTimeout(() => {
            displayMessage("Registration successful! Redirecting to login...", "success");
            setTimeout(() => loginTab.click(), 1500); // Switch to login tab
        }, 2000);
    });

    // Helper functions
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function displayMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = "message " + type;
    }

    // Initialize default tab
    loginTab.click();
});
