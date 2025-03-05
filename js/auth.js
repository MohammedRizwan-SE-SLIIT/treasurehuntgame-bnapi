document.addEventListener("DOMContentLoaded", function () {
    const GOOGLE_CLIENT_ID = "920001052636-2licjcmm9iu1oeq8ntpq5jjet1meksgh.apps.googleusercontent.com"; // Replace with your actual client ID

    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const virtualIdentityForm = document.getElementById("pirate-persona-form");
    const messageBox = document.getElementById("message-box");

    let userId; // Store the user ID after login or registration

    // Tab switching
    loginTab.addEventListener("click", () => switchTab('login'));
    registerTab.addEventListener("click", () => switchTab('register'));

    function switchTab(tab) {
        loginForm.classList.toggle('hidden', tab !== 'login');
        registerForm.classList.toggle('hidden', tab !== 'register');
        virtualIdentityForm.classList.toggle('hidden', true); // Ensure virtual identity form is hidden
        loginTab.classList.toggle('active', tab === 'login');
        registerTab.classList.toggle('active', tab === 'register');
        clearMessage();
    }

    // Generate strong password
    function generateStrongPassword() {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\:;?><,./-=";
        let password = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        return password;
    }

    // Suggest a strong password for registration
    document.getElementById("suggest-password").addEventListener("click", function() {
        const newPassword = generateStrongPassword();
        document.getElementById("register-password").value = newPassword;
        document.getElementById("confirm-password").value = newPassword;
    });

    // Show the Login form by default
    switchTab('login');

    // Authentication functions
    function handleAuth(type) {
        const username = document.getElementById(`${type}-username`).value.trim();
        const password = document.getElementById(`${type}-password`).value.trim();
        const email = type === 'register' ? document.getElementById("register-email").value.trim() : null;
        const confirmPassword = type === 'register' ? document.getElementById("confirm-password").value.trim() : null;

        if (!username || !password || (type === 'register' && (!email || password !== confirmPassword))) {
            showMessage(type === 'register' ? "Please fill in all fields and ensure passwords match." : "Please fill in all fields.", "error");
            return;
        }

        var formData = new FormData();
        formData.append('action', type);
        formData.append(`${type}-username`, username);
        formData.append(`${type}-password`, password);
        if (email) formData.append('register-email', email);

        fetch('../php/auth.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                localStorage.setItem("guestMode", "false");
                localStorage.setItem("username", username);
                showMessage(data.message || `Welcome back, ${username}!`, "success");
                userId = data.userId; // Store user ID from backend
                // After successful login/registration, show virtual identity form
                showVirtualIdentityForm();
            } else {
                showMessage(data.error, "error");
            }
        })
        .catch(error => {
            console.error(`Error during ${type}:`, error);
            showMessage(`An error occurred during ${type}. Please try again.`, "error");
        });
    }

    // Trigger authentication based on button clicked
    document.getElementById("login-btn").addEventListener("click", () => handleAuth("login"));
    document.getElementById("register-btn").addEventListener("click", () => handleAuth("register"));

    // Guest mode functionality
    document.getElementById("guest-btn").addEventListener("click", () => {
        localStorage.setItem("guestMode", "true");
        showMessage("Welcome to Guest Mode!", "success");
        setTimeout(() => {
            window.location.href = "../game/game.html"; // Redirect to game page
        }, 1000);
    });

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
                    showMessage("Authentication failed! Please try again.", "error");
                }
            })
            .catch((error) => {
                console.error("Error during authentication:", error);
                showMessage("An error occurred. Please try again.", "error");
            });
    }
  
    
    // Handle show the login part after authentication
    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = 'block';
    }

    function clearMessage() {
        messageBox.textContent = "";
        messageBox.style.display = 'none';
    }
      function showVirtualIdentityForm() {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        virtualIdentityForm.classList.remove('hidden');
    }
  
    // Save Virtual Identity
    document.getElementById("save-persona-btn").addEventListener("click", function() {
            const displayName = document.getElementById("display-name").value.trim();
            const avatarUrl = document.getElementById("avatar-url").value.trim();

            var formData = new FormData();
            formData.append('action', 'create_identity');
            formData.append('userId', userId); // Assuming you have userId available
            formData.append('displayName', displayName);
            formData.append('avatarUrl', avatarUrl);

            fetch('../php/auth.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage("Virtual identity created successfully!", "success");
                    setTimeout(() => window.location.href = "../game/game.html", 1000);
                } else {
                    showMessage(data.error || "Failed to create virtual identity.", "error");
                }
            })
            .catch(error => {
                console.error("Error creating virtual identity:", error);
                showMessage("An error occurred. Please try again.", "error");
            });
      });

});
