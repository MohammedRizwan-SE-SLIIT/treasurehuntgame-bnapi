document.addEventListener("DOMContentLoaded", () => {
    // Load game state from Session Storage
    let level = parseInt(sessionStorage.getItem("level")) || 1;
    let lives = parseInt(sessionStorage.getItem("lives")) || 4;
    let treasuresCollected = parseInt(sessionStorage.getItem("treasuresCollected")) || 0;

    // Game Variables
    let timer;
    let baseTimeLeft = 60;
    let timeLeft = baseTimeLeft;
    let correctAnswers = 0;
    let totalAttempts = 0;
    let isTrickyQuestion = false;
    let trickyAttempts = 0;
    let trickyTreasureValues = [4, 2, 1];
    let currentTreasureValue = 6;
    const guestMode = localStorage.getItem("guestMode") === "true";

    // HTML element references
    const levelInfo = document.getElementById("level");
    const livesDisplay = document.getElementById("lives");
    const timerDisplay = document.getElementById("timer");
    const questionImage = document.getElementById("math-image");
    const answerInput = document.getElementById("answer-input");
    const submitButton = document.getElementById("submit-answer");
    const feedbackMessage = document.getElementById("feedback-message");
    const treasureCollectedDisplay = document.getElementById("treasure-collected");
    const playerStats = document.getElementById("player-stats");

    // Dynamic Accent Colors
    const colors = [
        { primary: "#ff7eb3", secondary: "#ff758c" },
        { primary: "#6a5acd", secondary: "#483d8b" },
        { primary: "#00bfff", secondary: "#1e90ff" },
        { primary: "#32cd32", secondary: "#228b22" }
    ];

    // Randomly select a color scheme on page load
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.documentElement.style.setProperty("--primary-color", randomColor.primary);
    document.documentElement.style.setProperty("--secondary-color", randomColor.secondary);

    // Inline Dark Mode toggle creation
    const themeToggleButton = document.createElement("button");
    themeToggleButton.id = "themeToggle";
    themeToggleButton.textContent = "Dark Mode: Disabled";
    themeToggleButton.style.position = "fixed";
    themeToggleButton.style.bottom = "20px";
    themeToggleButton.style.right = "20px";
    themeToggleButton.style.padding = "10px 15px";
    themeToggleButton.style.background = "var(--button-background)";
    themeToggleButton.style.color = "var(--button-text-color)";
    themeToggleButton.style.border = "none";
    themeToggleButton.style.borderRadius = "5px";
    themeToggleButton.style.cursor = "pointer";
    themeToggleButton.style.fontSize = "1rem";
    themeToggleButton.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    themeToggleButton.style.transition = "transform 0.2s, box-shadow 0.2s";
    themeToggleButton.style.zIndex = "1000";
    document.body.appendChild(themeToggleButton);

    const currentTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    themeToggleButton.textContent = currentTheme === "dark" ? "Dark Mode: Enabled" : "Dark Mode: Disabled";

    themeToggleButton.addEventListener("click", () => {
        const newTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        themeToggleButton.textContent = newTheme === "dark" ? "Dark Mode: Enabled" : "Dark Mode: Disabled";
    });

    // Fetch a new math problem using Banana API
    async function fetchMathProblem() {
        try {
            const response = await fetch(`https://marcconrad.com/uob/banana/api.php?out=json`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            const data = await response.json();
            if (!data.question || !data.solution) {
                throw new Error('Invalid API response');
            }

            // Show the image and hide the div for regular questions
            const mathImage = document.getElementById("math-image");
            const mathQuestion = document.getElementById("math-question");
            mathImage.style.display = "block";
            mathQuestion.style.display = "none";

            mathImage.src = data.question; // Set the question image URL
            mathImage.dataset.answer = data.solution; // Store the correct answer in the dataset

            // Reset timer for the new problem
            resetTimer();
        } catch (error) {
            console.error('Error fetching math problem:', error);
            // Removed feedbackMessage.textContent assignment
            setTimeout(fetchMathProblem, 3000);
        }
    }

    // Helper function to call the Basic Calculation API
    async function callAPI(endpoint, method, params) {
        const url = new URL(`http://localhost:8000${endpoint}`); // Update base URL if necessary
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

        const response = await fetch(url, { method });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        return response.json();
    }

    // Generate a tricky math question using the Basic Calculation API
    async function generateTrickyMathQuestion() {
        try {
            // Randomly select an operation
            const operations = ['add', 'subtract', 'multiply', 'divide'];
            const operation = operations[Math.floor(Math.random() * operations.length)];

            // Generate random numbers for the operation
            const num1 = Math.floor(Math.random() * 100) + 1;
            const num2 = Math.floor(Math.random() * 100) + 1;

            // Map operation to API endpoint
            const operationEndpoints = {
                add: '/basic-calculation/add/',
                subtract: '/basic-calculation/subtract/',
                multiply: '/basic-calculation/multiply/',
                divide: '/basic-calculation/divide/',
            };

            // Ensure no division by zero
            if (operation === 'divide' && num2 === 0) {
                return generateTrickyMathQuestion();
            }

            // Call the appropriate API endpoint
            const solution = await callAPI(operationEndpoints[operation], 'GET', { num1, num2 });

            // Check if the API returned an error
            if (solution.error) {
                console.error("API Error:", solution.error);
                setTimeout(generateTrickyMathQuestion, 3000); // Retry after a delay
                return;
            }

            // Ensure the response contains the required data
            if (!solution.resultado) {
                console.error("Invalid API response: Missing 'resultado'");
                setTimeout(generateTrickyMathQuestion, 3000); // Retry after a delay
                return;
            }

            // Display the tricky question
            const operationSymbols = {
                add: '+',
                subtract: '-',
                multiply: '*',
                divide: '/',
            };
            const question = `${num1} ${operationSymbols[operation]} ${num2} = ?`;

            // Hide the image and show the div for tricky questions
            const mathImage = document.getElementById("math-image");
            const mathQuestion = document.getElementById("math-question");
            mathImage.style.display = "none";
            mathQuestion.style.display = "block";
            mathQuestion.textContent = question; // Set the question text
            mathQuestion.dataset.answer = solution.resultado.toString(); // Store the correct answer in the dataset
 
            feedbackMessage.textContent = "Solve this tricky question to regain your lives!";
            isTrickyQuestion = true;
          
            // Hide the timer display for tricky questions
            timerDisplay.style.display = "none";
            clearInterval(timer); // Stop any running timer

            // Ensure lives are set to 0 if tricky question is triggered
            lives = 0;
            updateUI(); // Update the UI to reflect the correct heart count
        } catch (error) {
            console.error("Error fetching tricky math question:", error);
            // Removed feedbackMessage.textContent assignment
            setTimeout(generateTrickyMathQuestion, 3000);
        }
    }

    // Timer Logic
    function startTimer() {
        timerDisplay.style.display = "block"; // Ensure the timer is visible for regular questions
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time Left: ${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(timer);
                timeLeft = 0; // Prevent negative timer values
                if (isTrickyQuestion) {
                    playSound('game-over-sound');
                    showGameOverPopup();
                    answerInput.disabled = true; // Disable input box
                } else {
                    handleWrongAnswer(); // Time's up, treat as incorrect answer
                }
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timer);
        timeLeft = baseTimeLeft;
        startTimer();
    }


    function handleAnswerSubmission() {
        const playerAnswer = answerInput.value.trim(); // Trim whitespace from the input
        const correctAnswer = isTrickyQuestion
            ? document.getElementById("math-question").dataset.answer
            : questionImage.dataset.answer;

        totalAttempts++;

        // Ensure both answers are compared as strings to avoid type mismatches
        if (playerAnswer === correctAnswer.toString()) {
            handleCorrectAnswer();
        } else {
            handleWrongAnswer();
        }

        updateStats();
        answerInput.value = "";
    }

    submitButton.addEventListener("click", handleAnswerSubmission);
    answerInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleAnswerSubmission();
        }
    });

 
    async function handleCorrectAnswer() {
        // Prevent progression for guest users beyond level 2
        if (guestMode && level >= 2) {
            showLoginPrompt();
            return; // Stop further progression
        }

        feedbackMessage.textContent = "Correct! 🎉 Treasure unlocked!";
        level++;
        correctAnswers++;
        treasuresCollected += currentTreasureValue;
        sessionStorage.setItem('treasuresCollected', treasuresCollected);
        document.getElementById('treasure-collected').textContent = treasuresCollected;
        sessionStorage.setItem('level', level);
        document.getElementById('level').textContent = level;
        playSound('correct-sound');
        showTreasureAnimation();
        updateUI(); // Update UI to reflect new level
        await fetchMathProblem(); // Load next problem
        isTrickyQuestion = false;
        answerInput.disabled = false; // Enable input box

        // Regain 1 heart if a tricky question was answered correctly
        if (trickyAttempts > 0 && lives === 0) {
            lives = 1; // Regain exactly 1 heart
            trickyAttempts = 0; // Reset tricky attempts
        }

        // Adjust treasure value based on level
        if (level > 10) {
            currentTreasureValue = 6;
        } else if (trickyAttempts > 0) {
            currentTreasureValue = trickyTreasureValues[trickyAttempts - 1];
        }

        saveGameState(); // Save updated state
    }

    // Wrong Answer Handling
    function handleWrongAnswer() {
        playSound('wrong-sound');
        if (lives > 0) {
            lives--;
        }
        sessionStorage.setItem('lives', lives);
        document.getElementById('lives').textContent = lives;
        feedbackMessage.textContent = `Incorrect! ${lives} hearts left. 💔`;

        if (lives === 0 && trickyAttempts < 3) {
            generateTrickyMathQuestion(); // Generate tricky question when out of lives
            trickyAttempts++;
            return;
        }

        if (lives === 0 && trickyAttempts >= 3) {
            handleTrickyQuestionFailure(); // Handle game over after tricky question failure
            return;
        }

        if (!isTrickyQuestion) {
            resetTimer();
        }

        updateUI();
        saveGameState(); // Save updated state
    }

    // Show Treasure Animation
    function showTreasureAnimation() {
        const treasureChestImgUrl =
            "https://pplx-res.cloudinary.com/image/upload/v1741400427/user_uploads/bPlMhFDMUuVfybo/treasure.jpg"; 

        const treasureDiv = document.createElement("div");
        treasureDiv.classList.add("treasure-animation");
        
        const treasureImg = document.createElement("img");
        treasureImg.src = treasureChestImgUrl;
        
        treasureDiv.appendChild(treasureImg);
        
        document.body.appendChild(treasureDiv);

        setTimeout(() => treasureDiv.remove(), 2000); // Remove animation after 2 seconds
    }

    // Show Game Over Popup
    function showGameOverPopup() {
        const popup = document.createElement("div");
        popup.classList.add("game-over-popup");

        const message = document.createElement("p");
        message.textContent = `Game Over! 💀 You answered ${correctAnswers} out of ${totalAttempts} questions correctly. Your accuracy is ${(correctAnswers / totalAttempts * 100).toFixed(2)}%.`;

        const scoreMessage = document.createElement("p");
        scoreMessage.textContent = `Your Score: Level ${level}, Treasures Collected: ${treasuresCollected}`;

        const leaderboardMessage = document.createElement("p");
        leaderboardMessage.textContent = "Checking if you've beaten your previous record...";

        const restartButton = document.createElement("button");
        restartButton.textContent = "Start Over";
        restartButton.addEventListener("click", () => {
            location.reload();
        });

        const dashboardButton = document.createElement("button");
        dashboardButton.textContent = "Go to Dashboard";
        dashboardButton.addEventListener("click", () => {
            window.location.href = "../html/dashboard.html";
        });

        popup.appendChild(message);
        popup.appendChild(scoreMessage);
        popup.appendChild(leaderboardMessage);
        popup.appendChild(restartButton);
        popup.appendChild(dashboardButton);
        document.body.appendChild(popup);

        // Check and update leaderboard
        checkAndUpdateLeaderboard(level, treasuresCollected, leaderboardMessage);
    }

    // Check and Update Leaderboard
    function checkAndUpdateLeaderboard(level, treasuresCollected, leaderboardMessage) {
        const jwtToken = localStorage.getItem("jwt"); // Retrieve JWT token

        if (!jwtToken) {
            leaderboardMessage.textContent = "You are playing as a guest. Login to save your score!";
            return;
        }

        fetch("../php/get_dashboard_data.php", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch leaderboard data.");
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    const previousLevel = data.userProgress.highest_level || 0;
                    const previousTreasures = data.userProgress.total_treasures || 0;

                    if (level > previousLevel || (level === previousLevel && treasuresCollected > previousTreasures)) {
                        // Update leaderboard if the current score is better
                        updateLeaderboard(level, treasuresCollected);
                        leaderboardMessage.textContent = "Congratulations! You've beaten your previous record. Your score has been updated on the leaderboard.";
                    } else {
                        // Show current score without updating leaderboard
                        leaderboardMessage.textContent = "Your score is lower than your previous record. It will not be updated on the leaderboard.";
                    }
                } else {
                    leaderboardMessage.textContent = "Error fetching leaderboard data.";
                }
            })
            .catch(error => {
                console.error("Error checking leaderboard:", error);
                leaderboardMessage.textContent = "Error checking leaderboard. Please try again later.";
            });
    }

    // Update Leaderboard
    function updateLeaderboard(level, treasuresCollected) {
        const jwtToken = localStorage.getItem("jwt"); // Retrieve JWT token

        fetch("../php/update_leaderboard.php", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${jwtToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ highestLevel: level, totalTreasures: treasuresCollected })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to update leaderboard.");
                }
                return response.json();
            })
            .then(data => {
                if (!data.success) {
                    console.error("Error updating leaderboard:", data.error);
                }
            })
            .catch(error => {
                console.error("Error updating leaderboard:", error);
            });
    }

    // Handle Tricky Question Failure
    function handleTrickyQuestionFailure() {
        if (trickyAttempts >= 3) {
            playSound("game-over-sound");
            showGameOverPopup();
            answerInput.disabled = true; // Disable input box
        }
    }

    // Show Login Prompt for Guests
    function showLoginPrompt() {
        // Prevent duplicate modals
        if (document.getElementById("loginPromptModal")) return;

        // Create modal overlay
        const modalOverlay = document.createElement("div");
        modalOverlay.id = "loginPromptModal";
        modalOverlay.style.position = "fixed";
        modalOverlay.style.top = "0";
        modalOverlay.style.left = "0";
        modalOverlay.style.width = "100%";
        modalOverlay.style.height = "100%";
        modalOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        modalOverlay.style.display = "flex";
        modalOverlay.style.alignItems = "center";
        modalOverlay.style.justifyContent = "center";
        modalOverlay.style.zIndex = "1000";

        // Create modal content
        const modalContent = document.createElement("div");
        modalContent.style.backgroundColor = "#fff";
        modalContent.style.padding = "20px";
        modalContent.style.borderRadius = "10px";
        modalContent.style.textAlign = "center";
        modalContent.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
        modalContent.innerHTML = `
            <p style="font-size: 1.5rem; margin-bottom: 20px;">You've reached level 2! Please log in to continue.</p>
            <button id="loginButton" style="padding: 10px 20px; background-color: #d4af37; color: #000; border: none; border-radius: 5px; cursor: pointer;">Log In</button>
        `;

        // Append modal content to overlay
        modalOverlay.appendChild(modalContent);
        document.body.appendChild(modalOverlay);

        // Add event listener to login button
        document.getElementById("loginButton").addEventListener("click", () => {
            window.location.href = "../html/auth.html";
        });
    }

    // Update leaderboard with current player's score
    function updateLeaderboard() {
        const highestLevel = level;
        const totalTreasures = treasuresCollected;

        fetch('../php/update_leaderboard.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `highestLevel=${highestLevel}&totalTreasures=${totalTreasures}`
        })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                console.error('Error updating leaderboard:', data.error);
            }
        })
        .catch(error => {
            console.error('Error updating leaderboard:', error);
        });
    }

    // Update Stats Display
    function updateStats() {
        const accuracy =
            totalAttempts > 0 ? ((correctAnswers / totalAttempts) * 100).toFixed(2) : 0;

        playerStats.textContent = `Accuracy: ${accuracy}%`;
        treasureCollectedDisplay.textContent = `Treasures Collected: ${treasuresCollected}`;
    }

    // // Update UI After Losing a Heart or Progressing a Level
    // function updateUI() {
    //     levelInfo.textContent = `Level: ${level}`;
    //     livesDisplay.textContent = `Hearts: ${'❤'.repeat(Math.max(lives, 0))}`; // Prevent negative heart display
    //     treasureCollectedDisplay.textContent = `Treasures Collected: ${treasuresCollected}`;
    // }

  // Update UI After Losing a Heart or Progressing a Level
  function updateUI() {
    levelInfo.textContent = ` ${level}`;
    livesDisplay.textContent = ` ${'❤'.repeat(Math.max(lives, 0))}`; // Prevent negative heart display
    treasureCollectedDisplay.textContent = ` ${treasuresCollected}`;
}
    // Play Sound Effects
    function playSound(soundId) {
        const sound = document.getElementById(soundId);
        if (sound && typeof sound.play === 'function') {
            sound.play().catch(error => {
                console.error('Error playing sound:', error);
            });
        } else {
            console.error('Sound element not found or invalid:', soundId);
        }
    }

    // Save game state to Session Storage
    function saveGameState() {
        sessionStorage.setItem("level", level);
        sessionStorage.setItem("lives", lives);
        sessionStorage.setItem("treasuresCollected", treasuresCollected);
    }

    // Reset game state on game over
    function resetGameState() {
        sessionStorage.removeItem("level");
        sessionStorage.removeItem("lives");
        sessionStorage.removeItem("treasuresCollected");
    }

    // Initialize Game on Page Load
    fetchMathProblem(); 
    startTimer();

    // Dashboard modal logic
    const dashboardButton = document.getElementById("dashboardButton");
    const confirmationModal = document.getElementById("confirmationModal");
    const closeButton = document.querySelector(".close-button");
    const confirmYes = document.getElementById("confirmYes");
    const confirmNo = document.getElementById("confirmNo");

    dashboardButton.addEventListener("click", () => {
        confirmationModal.style.display = "flex"; // Show modal as a popup
    });

    closeButton.addEventListener("click", () => {
        confirmationModal.style.display = "none"; // Hide modal
    });

    confirmYes.addEventListener("click", () => {
        window.location.href = "../html/dashboard.html";
    });

    confirmNo.addEventListener("click", () => {
        confirmationModal.style.display = "none"; // Hide modal
    });

    window.onclick = (event) => {
        if (event.target === confirmationModal) {
            confirmationModal.style.display = "none"; // Hide modal if clicked outside
        }
    };
});

document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username') || 'Guest';
    const avatarUrl = localStorage.getItem('avatarUrl') || '../assets/default-avatar.png';

    // Update profile container
    document.getElementById('pirateName').innerText = username;
    document.getElementById('avatar').src = avatarUrl;

    // Logout button functionality
    document.getElementById('logoutButton').addEventListener('click', function () {
        localStorage.clear(); // Clear all localStorage data
        sessionStorage.clear(); // Clear session storage
        window.location.href = "../html/auth.html"; // Redirect to login page
    });

    // Dashboard button functionality
    const dashboardButton = document.getElementById('dashboardButton');
    dashboardButton.addEventListener('click', function () {
        sessionStorage.clear(); // Clear session storage when navigating back to the dashboard
        window.location.href = "../html/dashboard.html"; // Redirect to dashboard
    });

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) { // Add null check
        themeToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
        });
    } else {
        console.error("Theme toggle button not found.");
    }
});
