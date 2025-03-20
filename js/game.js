document.addEventListener("DOMContentLoaded", () => {
    // Game Variables
    let level = 1;
    let lives = 4;
    let timer;
    let baseTimeLeft = 60;
    let timeLeft = baseTimeLeft;
    let correctAnswers = 0;
    let totalAttempts = 0;
    let treasuresCollected = 0;
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
            questionImage.src = data.question; // Set question image URL
            questionImage.dataset.answer = data.solution; // Store correct answer in dataset

            // Reset timer for the new problem
            resetTimer();
        } catch (error) {
            console.error('Error fetching math problem:', error);
            feedbackMessage.textContent = "Failed to load math problem. Please try again.";
            // Retry fetching the math problem after a delay
            setTimeout(fetchMathProblem, 3000);
        }
    }

    // Generate a tricky math question using Wolfram Alpha Short Answers API
    async function generateTrickyMathQuestion() {
        const appKey = "7E9Q3E-8VHYT9JLXW";
        const query = encodeURIComponent("random math problem");

        try {
            const response = await fetch(`https://api.wolframalpha.com/v1/result?i=${query}&appid=${appKey}`);
            if (!response.ok) {
                throw new Error(`Wolfram API Error: ${response.status}`);
            }

            const solution = await response.text();
            const question = "Solve this tricky math problem:"; // Placeholder question text

            questionImage.src = ""; // Clear the image
            questionImage.alt = question; // Display the question as alt text
            questionImage.dataset.answer = solution.trim(); // Store the correct answer in the dataset
            feedbackMessage.textContent = "Solve this tricky question to regain your lives!";
            isTrickyQuestion = true;
            timeLeft = Math.max(30, baseTimeLeft - (trickyAttempts * 5)); // Reduce timer by 5s for each tricky attempt
            startTimer();
        } catch (error) {
            console.error("Error fetching tricky math question:", error);
            feedbackMessage.textContent = "Failed to load tricky question. Please try again.";
            // Retry fetching the tricky question after a delay
            setTimeout(generateTrickyMathQuestion, 3000);
        }
    }

    // Timer Logic
    function startTimer() {
        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time Left: ${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(timer);
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

    // Handle Answer Submission
    function handleAnswerSubmission() {
        const playerAnswer = answerInput.value.trim();
        const correctAnswer = questionImage.dataset.answer;
        totalAttempts++;

        if (playerAnswer === correctAnswer) {
            handleCorrectAnswer();
        } else {
            handleWrongAnswer();
        }
        updateStats();
        answerInput.value = ""; // Clear the input field
    }

    submitButton.addEventListener("click", handleAnswerSubmission);
    answerInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            handleAnswerSubmission();
        }
    });

    // Correct Answer Handling
    async function handleCorrectAnswer() {
        feedbackMessage.textContent = "Correct! 🎉 Treasure unlocked!";
        level++;
        correctAnswers++;
        treasuresCollected += currentTreasureValue;
        playSound('correct-sound');
        showTreasureAnimation();
        updateUI(); // Update UI to reflect new level
        await fetchMathProblem(); // Load next problem
        isTrickyQuestion = false;
        answerInput.disabled = false; // Enable input box

        // Adjust treasure value based on level
        if (level > 10) {
            currentTreasureValue = 6;
        } else if (trickyAttempts > 0) {
            currentTreasureValue = trickyTreasureValues[trickyAttempts - 1];
        }

        // Prompt guest to log in after level 2
        if (guestMode && level > 2) {
            showLoginPrompt();
        }
    }

    // Wrong Answer Handling
    function handleWrongAnswer() {
        playSound('wrong-sound');
        if (lives > 0) {
            lives--;
        }
        feedbackMessage.textContent = `Incorrect! ${lives} hearts left. 💔`;

        if (lives === 0 && trickyAttempts < 3) {
            generateTrickyMathQuestion(); // Generate tricky question when out of lives
            trickyAttempts++;
            return;
        }

        if (!isTrickyQuestion) {
            resetTimer();
        }

        updateUI();
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
        message.textContent = `Game Over! 💀 You answered ${correctAnswers} out of ${totalAttempts} questions correctly. Your accuracy is ${(correctAnswers / totalAttempts * 100).toFixed(2)}%. Start over and see how far you can collect treasure! Arrr!`;

        const restartButton = document.createElement("button");
        restartButton.textContent = "Start Over";
        restartButton.addEventListener("click", () => {
            location.reload();
        });

        const dashboardButton = document.createElement("button");
        dashboardButton.textContent = "Go to Dashboard";
        dashboardButton.addEventListener("click", () => {
            updateLeaderboard();
            window.location.href = "../html/dashboard.html";
        });

        popup.appendChild(message);
        popup.appendChild(restartButton);
        popup.appendChild(dashboardButton);
        document.body.appendChild(popup);
    }

    // Show Login Prompt for Guests
    function showLoginPrompt() {
        const popup = document.createElement("div");
        popup.classList.add("login-prompt-popup");

        const message = document.createElement("p");
        message.textContent = "You've reached level 2! Please log in to continue.";

        const loginButton = document.createElement("button");
        loginButton.textContent = "Log In";
        loginButton.addEventListener("click", () => {
            window.location.href = "../html/auth.html";
        });

        popup.appendChild(message);
        popup.appendChild(loginButton);
        document.body.appendChild(popup);
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

    // Update UI After Losing a Heart or Progressing a Level
    function updateUI() {
        levelInfo.textContent = `Level: ${level}`;
        livesDisplay.textContent = `Lives: ${'❤'.repeat(lives)}`;
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

    // Initialize Game on Page Load
    fetchMathProblem(); 
    startTimer();
});
