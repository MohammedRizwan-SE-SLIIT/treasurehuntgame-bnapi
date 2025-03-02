document.addEventListener("DOMContentLoaded", function () {
    
    // DOM Elements
    const loginTab = document.getElementById("login-tab");
    const registerTab = document.getElementById("register-tab");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const messageBox = document.getElementById("message-box");
 
    // Tab Switching Logic
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
 
    // Guest Mode Logic
    document.getElementById("guest-btn").addEventListener("click", () => {
        localStorage.setItem("guestMode", "true");
        showMessage("Welcome to Guest Mode!", "success");
        window.location.href = "../game/game.html"; // Redirect to game page
    });
 
    // Utility Functions
    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
    }
 
 });
 