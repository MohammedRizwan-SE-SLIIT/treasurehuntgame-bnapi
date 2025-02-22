// Game Flow with Guest Access and Level Restriction

document.addEventListener("DOMContentLoaded", function () {
    let currentLevel = 1;
    let hearts = 4;
    let sessionActive = false;
    let isGuest = false;

    const startGameBtn = document.getElementById("startGame");
    const gameCanvas = document.getElementById("gameCanvas");
    const messageBox = document.getElementById("message-box");
    
    startGameBtn.addEventListener("click", function () {
        startGame();
    });

    function startGame() {
        sessionActive = true;
        showMessage("Level 1: Let the treasure hunt begin!", "info");
        loadLevel(currentLevel);
    }

    function loadLevel(level) {
        if (isGuest && level > 2) {
            showGuestPrompt();
        } else {
            fetchMathChallenge(level);
        }
    }

    function fetchMathChallenge(level) {
        showMessage(`Fetching challenge for Level ${level}...`, "info");
        // Simulate API call (replace with actual Banana API integration)
        setTimeout(() => {
            showMessage(`Solve the puzzle to find the treasure!`, "success");
            // Render question (dummy example)
            gameCanvas.innerHTML = `<p>Solve: 5 + 3 = ?</p>`;
        }, 1000);
    }

    function showGuestPrompt() {
        gameCanvas.innerHTML = `
            <div class="guest-prompt">
                <h2>You’re on a roll! 🎉</h2>
                <p>Want to keep the treasure hunt going? Log in to continue your adventure and unlock more levels, rewards, and surprises!</p>
                <button onclick="redirectToLogin()">Log In / Register</button>
                <button onclick="endSession()">End Game</button>
            </div>
        `;
    }

    function redirectToLogin() {
        window.location.href = "auth.html";
    }

    function endSession() {
        sessionActive = false;
        showMessage("Game Over. Come back anytime!", "error");
    }

    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message ${type}`;
    }

    // Initialize guest session
    function startGuestSession() {
        isGuest = true;
        showMessage("Welcome, Guest! You can play until Level 2.", "info");
        startGame();
    }

    window.startGuestSession = startGuestSession;
    window.redirectToLogin = redirectToLogin;
});

// Let me know if you want me to refine the UI or extend this flow! 🚀
