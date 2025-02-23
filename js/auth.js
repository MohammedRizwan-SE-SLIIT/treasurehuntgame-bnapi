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

    async function fetchMathChallenge(level) {
        try {
            showMessage(`Fetching challenge for Level ${level}...`, "info");

            // Call Banana API to fetch math challenge (example URL; modify based on actual endpoint)
            const response = await fetch(`https://marcconrad.com/uob/banana/api.php?level=${level}`);
            const data = await response.json();

            if (data.challenge) {
                showMessage(`Solve this puzzle to find the treasure!`, "success");
                gameCanvas.innerHTML = `<p>Solve: ${data.challenge}</p>`;
                handleChallengeAnswer(data.answer, level);
            } else {
                showMessage("No challenge found. Try again later.", "error");
            }
        } catch (error) {
            showMessage("Error fetching the challenge. Try again later.", "error");
        }
    }

    function handleChallengeAnswer(correctAnswer, level) {
        // Assume the user is solving the puzzle here (simple example)
        // In a real scenario, you would get input from the user (e.g., a form, button clicks, etc.)

        let userAnswer = prompt("Enter your answer:");
        if (parseInt(userAnswer) === correctAnswer) {
            showMessage("Correct! You've completed the level.", "success");
            currentLevel++;
            loadLevel(currentLevel); // Proceed to next level
        } else {
            hearts--;
            if (hearts > 0) {
                showMessage(`Wrong answer! You have ${hearts} hearts left. Try again.`, "error");
            } else {
                showMessage("Game Over! You've run out of hearts.", "error");
                endSession();
            }
        }
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
