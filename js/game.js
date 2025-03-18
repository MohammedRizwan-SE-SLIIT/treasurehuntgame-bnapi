document.addEventListener("DOMContentLoaded", function () {
    let currentLevel = 1;
    let hearts = 4;
    const maxLevelsForGuest = 2;
    let timer;
    let timeLeft = 60; // Time per level
    const initialTime = 60;
    let isGuest = localStorage.getItem("guestMode") === 'true';

    const levelInfo = document.getElementById("level-info");
    const heartsDisplay = document.getElementById("lives");
    const timerDisplay = document.getElementById("timer");
    const feedbackMessage = document.getElementById("feedback-message");
    const questionImage = document.getElementById("math-image");
    const answerInput = document.getElementById("answer-input");
    const submitButton = document.getElementById("submit-answer");
    const gameContainer = document.getElementById("game-container");

    // Timer setup
    function startTimer() {
        timeLeft = initialTime; // Reset timer to 60 seconds
        timerDisplay.textContent = `Time Left: ${timeLeft}s`;

        timer = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time Left: ${timeLeft}s`;
            if (timeLeft <= 0) {
                clearInterval(timer);
                handleTimeOut();
            }
        }, 1000);
    }

    // Handle Time-Out: Deduct heart or trigger trap
    function handleTimeOut() {
        hearts--;
        updateHeartsUI();
        if (hearts === 0) {
            triggerTrap();
        } else {
            feedbackMessage.textContent = "Time's up! You lost a heart.";
            feedbackMessage.className = "error";
            fetchMathProblem(); // Get next question
        }
    }

    // Fetch dynamic math problems based on level
    async function fetchMathProblem(difficulty = currentLevel, useBase64 = false) {
        try {
            // Use Base64 encoding if specified, otherwise use regular image URL
            const apiUrl = useBase64 
                ? 'https://cors-anywhere.herokuapp.com/http://marcconrad.com/uob/banana/api.php?out=json&base64=yes'  // Base64 encoded response
                : 'https://cors-anywhere.herokuapp.com/http://marcconrad.com/uob/banana/api.php?out=json';  // Regular JSON with image URL
            
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.question && data.solution !== undefined) {
                if (useBase64) {
                    // Use Base64 encoded image directly
                    const imageData = `data:image/png;base64,${data.question}`;
                    questionImage.src = imageData;  // Set Base64 image as source
                } else {
                    // Use image URL
                    questionImage.src = data.question;  // Set URL as source
                }

                questionImage.alt = "Math Problem";
                questionImage.dataset.answer = data.solution;  // Store the solution (answer) in the dataset

                feedbackMessage.textContent = `Solve this question to continue!`;
                feedbackMessage.className = "info";
            } else {
                feedbackMessage.textContent = "No challenge found. Try again later.";
                feedbackMessage.className = "error";
            }
        } catch (error) {
            feedbackMessage.textContent = "Error fetching challenge. Try again later.";
            feedbackMessage.className = "error";
        }
    }

    function updateHeartsUI() {
        hearts = Math.max(0, hearts);  // Set hearts to 0 if it's negative
        heartsDisplay.textContent = `Hearts: ${'❤️'.repeat(hearts)}`;
    }
    // Check player's answer
    function checkAnswer() {
        const playerAnswer = answerInput.value.trim();
        const correctAnswer = questionImage.dataset.answer;
    
        if (parseInt(playerAnswer) === parseInt(correctAnswer)) {
            feedbackMessage.textContent = "Correct! Proceeding to next level...";
            feedbackMessage.className = "success";
            showTreasureAnimation();  // Show treasure animation when the answer is correct
            nextLevel();
        } else {
            feedbackMessage.textContent = "Incorrect! Try again.";
            feedbackMessage.className = "error";
            hearts--;
            updateHeartsUI();
            if (hearts === 0) {
                triggerTrap();
            }
        }
    }
    
    // Move to the next level
    function nextLevel() {
        currentLevel++;
        hearts = 4; // Reset hearts for the next level
        updateHeartsUI();
        updateLeaderboard();  // Update leaderboard after each level

         // Reset and start the timer again
         clearInterval(timer);  // Stop the existing timer
         timeLeft = initialTime; // Reset time to 60 seconds
         startTimer(); // Restart the timer

        if (currentLevel > maxLevelsForGuest && !isGuest) {
            showLoginPrompt();
        } else {
            fetchMathProblem(); // Get next question
        }
    }

    // Trigger trap if hearts reach zero
    function triggerTrap() {
        feedbackMessage.textContent = "Trap triggered! Solve a harder question or wait 45 minutes for hearts to reset.";
        fetchMathProblem(currentLevel + 2); // Fetch a harder question
        startTrapCountdown();
    }

    // Start trap countdown when time is up
    function startTrapCountdown() {
        let trapTimeLeft = 2700; // 45 minutes in seconds
        const trapTimer = setInterval(() => {
            trapTimeLeft--;
            feedbackMessage.innerHTML = `Time until heart reset: ${Math.floor(trapTimeLeft / 60)}m ${trapTimeLeft % 60}s`;

            if (trapTimeLeft <= 0) {
                clearInterval(trapTimer);
                resetHearts();
            }
        }, 1000);
    }

    // Reset hearts after trap countdown
    function resetHearts() {
        hearts = 4;
        feedbackMessage.textContent = "Hearts restored! Try again!";
        updateHeartsUI();
        fetchMathProblem(); // Get next question
    }

    // Display login prompt after guest reaches max level
    function showLoginPrompt() {
        gameContainer.innerHTML = `
            <h2>You've reached the guest limit!</h2>
            <p>Sign up or log in to continue your adventure and unlock more levels, rewards, and surprises!</p>
            <button onclick="window.location.href='../auth/auth.html'">Login / Register</button>
        `;
    }

    // Show Treasure Animation when player answers correctly
    function showTreasureAnimation() {
        const treasure = document.getElementById("treasure-chest");
        treasure.classList.remove("hidden");
        playSound('treasure-sound'); // Play treasure sound

        // Hide treasure chest after 2 seconds
        setTimeout(() => {
            treasure.classList.add("hidden");
        }, 2000);
    }

    // Update Leaderboard with current score (level)
    function updateLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        const currentScore = { name: "Player", level: currentLevel };

        leaderboard.push(currentScore);
        leaderboard.sort((a, b) => b.level - a.level); // Sort leaderboard by level

        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
        showLeaderboard();
    }

    // Show Leaderboard
    function showLeaderboard() {
        const leaderboardContainer = document.getElementById('leaderboard-list');
        const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboardContainer.innerHTML = '';

        leaderboard.forEach((entry, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = `Rank ${index + 1}: ${entry.name} - Level ${entry.level}`;
            leaderboardContainer.appendChild(listItem);
        });
    }

    // Show leaderboard when button clicked
    const leaderboardButton = document.getElementById('view-leaderboard');
    leaderboardButton.addEventListener('click', function () {
        const leaderboardContainer = document.getElementById('leaderboard');
        leaderboardContainer.classList.toggle('hidden');
        showLeaderboard();
    });

    // Play sound effect
    function playSound(soundId) {
        const sound = document.getElementById(soundId);
        if (sound) sound.play();
    }

    // Correct answer sound
    const correctSound = document.createElement('audio');
    correctSound.id = 'correct-sound';
    correctSound.src = '../assets/correct.mp3';
    document.body.appendChild(correctSound);

    // Wrong answer sound
    const wrongSound = document.createElement('audio');
    wrongSound.id = 'wrong-sound';
    wrongSound.src = '../assets/wrong.mp3';
    document.body.appendChild(wrongSound);

    // Trap sound (optional)
    const trapSound = document.createElement('audio');
    trapSound.id = 'trap-sound';
    trapSound.src = '../assets/trap.mp3';
    document.body.appendChild(trapSound);

    // Treasure sound
    const treasureSound = document.createElement('audio');
    treasureSound.id = 'treasure-sound';
    treasureSound.src = '../assets/treasure.mp3';
    document.body.appendChild(treasureSound);

    // Event listeners
    submitButton.addEventListener("click", checkAnswer);

    // Initialize the game
    fetchMathProblem();
    startTimer();
    updateHeartsUI();
});





      // Fetch dynamic math problems based on level
// async function fetchMathProblem(difficulty = currentLevel) {
//     try {
//         const apiUrl = `http://marcconrad.com/uob/banana/api.php?out=json&base64=yes`; // Using the default json response
//         const response = await fetch(apiUrl);
//         const data = await response.json();

//         if (data.question && data.solution !== undefined) {
//             // Display the question image
//             questionImage.src = data.question;
//             questionImage.alt = "Math Problem";
//             questionImage.dataset.answer = data.solution;  // Store the solution (answer) in the dataset

//             // Show the math question
//             feedbackMessage.textContent = `Solve this question to continue!`;
//             feedbackMessage.className = "info";
//         } else {
//             feedbackMessage.textContent = "No challenge found. Try again later.";
//             feedbackMessage.className = "error";
//         }
//     } catch (error) {
//         feedbackMessage.textContent = "Error fetching challenge. Try again later.";
//         feedbackMessage.className = "error";
//     }
// }


