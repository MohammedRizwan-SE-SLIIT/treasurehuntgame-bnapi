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
        livesDisplay.textContent = `Lives: ${'❤'.repeat(Math.max(lives, 0))}`; // Prevent negative heart display
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
