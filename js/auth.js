document.addEventListener("DOMContentLoaded", function () {
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const messageBox = document.getElementById("message-box");


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


    switchTab('login');

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
                    showMessage(`Welcome back, ${username}!`, "success");
                    setTimeout(() => {
                        window.location.href = "http://localhost/treasurehuntgame-bnapi/html/game.html"; // Redirect to game page
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

        if (!username || !email || !password || !confirmPassword) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", "error");
            return;
        }

        fetch("http://localhost/treasurehuntgame-bnapi/php/auth.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "register", username, email, password })
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
        localStorage.setItem("guestMode", "true");
        showMessage("Welcome to Guest Mode!", "success");
        setTimeout(() => {
            window.location.href = "http://localhost/treasurehuntgame-bnapi/html/game.html"; // Redirect to game page
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