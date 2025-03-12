document.addEventListener("DOMContentLoaded", function () {
    const GOOGLE_CLIENT_ID = "920001052636-2licjcmm9iu1oeq8ntpq5jjet1meksgh.apps.googleusercontent.com";
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const messageBox = document.getElementById("message-box");

    // Switch between Login and Register tabs
    loginTab.addEventListener("click", () => switchTab('login'));
    registerTab.addEventListener("click", () => switchTab('register'));

    function switchTab(tab) {
        if (tab === 'login') {
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
        } else if (tab === 'register') {
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
        }
        clearMessage();
    }

    // Show the Login form by default
    switchTab('login');

    // Login functionality
    document.getElementById("login-btn").addEventListener("click", () => {
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!username || !password) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        // Backend call to authenticate user
        if (username === "testuser" && password === "1234") {
            localStorage.setItem("guestMode", "false");
            localStorage.setItem("username", username);
            showMessage(`Welcome back, ${username}!`, "success");
            setTimeout(() => {
                window.location.href = "../game/game.html"; // Redirect to game page
            }, 1000);
        } else {
            showMessage("Invalid username or password.", "error");
        }
    });

    // Registration functionality
    document.getElementById("register-btn").addEventListener("click", () => {
        const username = document.getElementById("register-username").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        if (!username || !email || !password || !confirmPassword) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", "error");
            return;
        }

        // Registration backend call
        localStorage.setItem("guestMode", "false");
        localStorage.setItem("username", username);
        showMessage(`Registration successful! Welcome, ${username}.`, "success");
        setTimeout(() => {
            switchTab('login'); // Switch to login tab after registration
        }, 1000);
    });

    // Guest mode functionality
    document.getElementById("guest-btn").addEventListener("click", () => {
        localStorage.setItem("guestMode", "true");
        showMessage("Welcome to Guest Mode!", "success");
        setTimeout(() => {
            window.location.href = "../game/game.html"; // Redirect to game page
        }, 1000);
    });

    // Utility function to display messages
    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = 'block';
    }

    // Utility function to clear messages
    function clearMessage() {
        messageBox.textContent = "";
        messageBox.style.display = 'none';
    }

    // Initialize Google Sign-In after the DOM content is loaded
    window.onload = function () {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleSignIn, // Callback function for successful sign-in
        });

        // Render Google Sign-In button for Login and Register
        google.accounts.id.renderButton(
            document.querySelector('.g_id_signin'), // Target container for the button
            {
                theme: "outline",        // Button theme (outline or filled)
                size: "large",           // Size of the button (small, medium, large)
                type: "standard",        // Button type (standard or icon-only)
                shape: "pill",           // Shape of the button (rectangular or pill-shaped)
                width: "300px"           // Custom width for the button
            }
        );

        google.accounts.id.prompt(); // Automatically prompt users to sign in
    };

    /**
     * Handle Google Sign-In Response
     * @param {Object} response - The response object from Google Sign-In.
     */

    function handleGoogleSignIn(response) {
        console.log("Encoded JWT ID token: " + response.credential);
    
        // Send token to backend for validation
        fetch("http://localhost/treasurehuntgame-bnapi/php/auth.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: response.credential }), // Send the Google ID token
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    // Store user data locally or in session
                    localStorage.setItem("guestMode", "false");
                    localStorage.setItem("username", data.username || "Google User");
    
                    // Redirect to the game page after successful sign-in
                    window.location.href = data.redirect || '../game/game.html'; // Use redirect URL returned from the backend
                } else {
                    alert("Authentication failed! Please try again.");
                }
            })
            .catch((error) => {
                console.error("Error during authentication:", error);
                alert("An error occurred. Please try again.");
            });
    }




});
