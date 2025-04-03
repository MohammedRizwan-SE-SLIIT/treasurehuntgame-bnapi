document.addEventListener("DOMContentLoaded", function () {
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const messageBox = document.getElementById("message-box");

    // Tab switching
    loginTab.addEventListener("click", () => switchTab("login"));
    registerTab.addEventListener("click", () => switchTab("register"));

    function switchTab(tab) {
        if (tab === "login") {
            loginForm.classList.remove("hidden");
            registerForm.classList.add("hidden");
            loginTab.classList.add("active");
            registerTab.classList.remove("active");
        } else if (tab === "register") {
            registerForm.classList.remove("hidden");
            loginForm.classList.add("hidden");
            registerTab.classList.add("active");
            loginTab.classList.remove("active");
        }
        clearMessage();
    }

    switchTab("login");

    // Fix: Add event listener for password toggle buttons
    const togglePasswordButtons = document.querySelectorAll(".toggle-password");
    togglePasswordButtons.forEach((button) => {
        button.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default button behavior
            const input = this.previousElementSibling; // Get the associated input field
            if (input && input.type === "password") {
                input.type = "text";
                this.querySelector("img").src = "../assets/treasureopen.png"; // Change to open icon
            } else if (input) {
                input.type = "password";
                this.querySelector("img").src = "../assets/treasureclose.png"; // Change to close icon
            }
        });
    });

    // Suggest strong password
    document.getElementById("suggest-password").addEventListener("click", function () {
        const newPassword = generateStrongPassword();
        document.getElementById("register-password").value = newPassword;
        document.getElementById("confirm-password").value = newPassword;
        showMessage("Strong password suggested!", "success");
    });

    function generateStrongPassword() {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]\\:;?><,./-=";
        let password = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            password += charset.charAt(Math.floor(Math.random() * n));
        }
        return password;
    }

    // Login functionality
    document.getElementById("login-btn").addEventListener("click", (event) => {
        event.preventDefault(); 
        const username = document.getElementById("login-username").value.trim();
        const password = document.getElementById("login-password").value.trim();

        if (!username || !password) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        fetch("http://localhost/treasurehuntgame-bnapi/php/auth.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "login", username, password })
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    localStorage.setItem("jwt", data.token); // Store JWT in local storage
                    localStorage.setItem("guestMode", "false"); // Set guestMode to false
                    localStorage.setItem("username", username);
                    showMessage(`Welcome back, ${username}!`, "success");
                    setTimeout(() => {
                        window.location.href = "../html/dashboard.html"; // Redirect to dashboard
                    }, 1000);
                } else {
                    showMessage("Invalid username or password.", "error");
                }
            })
            .catch((error) => {
                console.error("Error during authentication:", error);
                showMessage("An error occurred. Please try again.", "error");
            });
    });

    document.getElementById("register-btn").addEventListener("click", (event) => {
        event.preventDefault(); 
        const username = document.getElementById("register-username").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();
        const avatarUrl = document.getElementById("selected-avatar").value.trim(); // Get the selected avatar URL

        if (!username || !email || !password || !confirmPassword || !avatarUrl) {
            showMessage("Please fill in all fields, including avatar selection.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", "error");
            return;
        }

        fetch("http://localhost/treasurehuntgame-bnapi/php/auth.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "register", username, email, password, avatarUrl })
        })
            .then((res) => {
                if (!res.ok) {
                    return res.text().then((text) => {
                        console.error("Server response:", text);
                        throw new Error("Server error");
                    });
                }
                return res.json();
            })
            .then((data) => {
                if (data.success) {
                    localStorage.setItem("jwt", data.token); // Store JWT in local storage
                    localStorage.setItem("guestMode", "false");
                    localStorage.setItem("username", username);
                    showMessage(`Registration successful! Welcome, ${username}.`, "success");
                    setTimeout(() => {
                        switchTab('login'); // Switch to login tab after registration
                    }, 1000);
                } else {
                    showMessage(data.error, "error");
                }
            })
            .catch((error) => {
                console.error("Error during registration:", error);
                showMessage("An error occurred. Please try again.", "error");
            });
    });

 
    document.getElementById("guest-btn").addEventListener("click", () => {
        localStorage.setItem("guestMode", "true"); // Set guestMode to true
        localStorage.setItem("username", "Guest"); // Set username to Guest
        localStorage.setItem("avatarUrl", "../assets/default-avatar.png"); // Set default avatar
        showMessage("Welcome to Guest Mode!", "success");
        setTimeout(() => {
            window.location.href = "../html/game.html"; // Redirect directly to the game page
        }, 1000);
    });

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = 'block';
    }


    function clearMessage() {
        messageBox.textContent = "";
        messageBox.style.display = 'none';
    }
});