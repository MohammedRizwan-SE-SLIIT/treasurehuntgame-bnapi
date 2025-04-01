document.addEventListener("DOMContentLoaded", function () {
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const virtualIdentityForm = document.getElementById("pirate-persona-form");
    const messageBox = document.getElementById("message-box");
    const togglePasswordButtons = document.querySelectorAll(".toggle-password");

    // Tab switching
    loginTab.addEventListener("click", () => switchTab("login"));
    registerTab.addEventListener("click", () => switchTab("register"));

    function switchTab(tab) {
        loginForm.classList.toggle("hidden", tab !== "login");
        registerForm.classList.toggle("hidden", tab !== "register");
        virtualIdentityForm.classList.add("hidden");
        loginTab.classList.toggle("active", tab === "login");
        registerTab.classList.toggle("active", tab === "register");
        clearMessage();
    }

    // Toggle password visibility
    togglePasswordButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const input = this.previousElementSibling;
            const isPasswordVisible = input.type === "text";
            input.type = isPasswordVisible ? "password" : "text";
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
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

    // Avatar selection logic
    function generateRandomAvatar() {
        const avatarParams = {
            topTypes: ["NoHair", "Eyepatch", "Hat", "Hijab", "Turban", "WinterHat1"],
            accessories: ["Blank", "Kurt", "Prescription01", "Round", "Sunglasses"],
            hairColors: ["Auburn", "Black", "Blonde", "Brown", "PastelPink"],
            facialHair: ["Blank", "BeardMedium", "MoustacheFancy"],
        };

        const params = new URLSearchParams({
            avatarStyle: "Circle",
            topType: avatarParams.topTypes[Math.floor(Math.random() * avatarParams.topTypes.length)],
            accessoriesType: avatarParams.accessories[Math.floor(Math.random() * avatarParams.accessories.length)],
            hairColor: avatarParams.hairColors[Math.floor(Math.random() * avatarParams.hairColors.length)],
            facialHairType: avatarParams.facialHair[Math.floor(Math.random() * avatarParams.facialHair.length)],
            clotheType: ["BlazerShirt", "CollarSweater", "GraphicShirt"][Math.floor(Math.random() * 3)],
            eyeType: ["Default", "Close", "Happy", "Hearts"][Math.floor(Math.random() * 4)],
            mouthType: ["Concerned", "Default", "Disbelief", "Grimace"][Math.floor(Math.random() * 4)],
            skinColor: ["Tanned", "Yellow", "Pale", "Light", "Brown"][Math.floor(Math.random() * 5)],
        });
        return `https://avataaars.io/?${params}`;
    }

    function showAvatarSuggestions() {
        const grid = document.getElementById("avatar-grid");
        grid.innerHTML = "";
        for (let i = 0; i < 6; i++) {
            const avatarUrl = generateRandomAvatar();
            const card = document.createElement("div");
            card.className = "avatar-card";
            card.innerHTML = `<img src="${avatarUrl}" alt="Pirate Avatar" onclick="selectAvatar('${avatarUrl}')">`;
            grid.appendChild(card);
        }
    }

    window.selectAvatar = (url) => {
        document.querySelectorAll(".avatar-card").forEach((card) => card.classList.remove("selected"));
        event.target.parentElement.classList.add("selected");
        document.getElementById("avatar-preview").src = url;
        document.getElementById("selected-avatar").value = url;
        localStorage.setItem("selectedAvatar", url);
    };

    document.getElementById("suggest-avatars").addEventListener("click", showAvatarSuggestions);

    // Initial load
    showAvatarSuggestions();

    // Utility functions
    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = "block";
    }

    function clearMessage() {
        messageBox.textContent = "";
        messageBox.style.display = "none";
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
            body: JSON.stringify({ action: "login", username, password }),
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
                    localStorage.setItem("avatarUrl", data.avatarUrl); // Store avatar URL
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

    // Register functionality
    document.getElementById("register-btn").addEventListener("click", (event) => {
        event.preventDefault();
        const username = document.getElementById("register-username").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();
        const avatarUrl = document.getElementById("selected-avatar").value.trim();

        if (!username || !email || !password || !confirmPassword || !avatarUrl) {
            showMessage("Please fill in all fields and select an avatar.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", "error");
            return;
        }

        console.log("Sending registration data:", { username, email, password, avatarUrl });

        fetch("http://localhost/treasurehuntgame-bnapi/php/auth.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "register", username, email, password, avatarUrl }),
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
                console.log("Registration response:", data);
                if (data.success) {
                    localStorage.setItem("jwt", data.token); // Store JWT in local storage
                    localStorage.setItem("guestMode", "false");
                    localStorage.setItem("username", username);
                    showMessage(`Registration successful! Welcome, ${username}.`, "success");
                    setTimeout(() => {
                        switchTab("login"); // Switch to login tab after registration
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

    // Guest mode functionality
    document.getElementById("guest-btn").addEventListener("click", () => {
        localStorage.setItem("guestMode", "true");
        showMessage("Welcome to Guest Mode!", "success");
        setTimeout(() => {
            window.location.href = "http://localhost/treasurehuntgame-bnapi/html/game.html"; // Redirect to game page
        }, 1000);
    });
});