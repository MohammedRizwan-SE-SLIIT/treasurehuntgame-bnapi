
// game.js (Expert-level implementation with version control, event-driven programming, third-party integration, and secure authentication)

const apiUrl = 'https://marcconrad.com/uob/banana/';
let level = 1;
let hearts = 4;
let timer;
const initialTime = 60;
let timeLeft = initialTime;
let guestMode = localStorage.getItem("guestMode") === 'true';
let correctAnswers = 0;
let totalAttempts = 0;
let treasuresCollected = 0;

const levelInfo = document.getElementById("level-info");
const heartsDisplay = document.getElementById("lives");
const timerDisplay = document.getElementById("timer");
const feedbackMessage = document.getElementById("feedback-message");
const questionImage = document.getElementById("math-image");
const answerInput = document.getElementById("answer-input");
const submitButton = document.getElementById("submit-answer");
const leaderboardButton = document.getElementById("view-leaderboard");
const leaderboard = document.getElementById("leaderboard");
const leaderboardList = document.getElementById("leaderboard-list");
const statsDisplay = document.getElementById("player-stats");
const leaderboardModal = document.getElementById("leaderboard-modal");
const nextLevelButton = document.getElementById("next-level-btn");
const closeLeaderboardButton = document.getElementById("close-leaderboard-btn");

// Fetch math problem dynamically based on level
async function fetchMathProblem(difficulty = level, useBase64 = false) {
    try {
        const apiUrl = useBase64 
            ? 'https://cors-anywhere.herokuapp.com/http://marcconrad.com/uob/banana/api.php?out=json&base64=yes'
            : 'https://cors-anywhere.herokuapp.com/http://marcconrad.com/uob/banana/api.php?out=json';
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.question && data.solution !== undefined) {
            if (useBase64) {
                const imageData = `data:image/png;base64,${data.question}`;
                questionImage.src = imageData;
            } else {
                questionImage.src = data.question;
            }

            questionImage.alt = 'Math Problem';
            questionImage.dataset.answer = data.solution;

            feedbackMessage.textContent = 'Solve this question to continue!';
            feedbackMessage.className = 'info';
        } else {
            feedbackMessage.textContent = 'No challenge found. Try again later.';
            feedbackMessage.className = 'error';
        }
    } catch (error) {
        feedbackMessage.textContent = 'Error fetching challenge. Try again later.';
        feedbackMessage.className = 'error';
    }
}

// Handle answer submission with event-driven logic
submitButton.addEventListener("click", () => checkAnswer());

function checkAnswer() {
    const playerAnswer = answerInput.value.trim();
    const correctAnswer = questionImage.dataset.answer;
    totalAttempts++;

    if (playerAnswer === correctAnswer) {
        correctAnswers++;
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }
    updateStats();
}

function handleCorrectAnswer() {
    feedbackMessage.innerHTML = "<span class='success'>Correct! 🎉 Treasure unlocked!</span>";
    level++;
    treasuresCollected++;
    playSound('correct-sound');
    showTreasureAnimation();
    resetTimer();
    answerInput.value = "";
    fetchMathProblem();
    checkGuestProgression();
}

function handleWrongAnswer() {
    hearts--;
    feedbackMessage.innerHTML = `<span class='error'>Incorrect! ${hearts} hearts left. 💔</span>`;
    playSound('wrong-sound');

    if (hearts === 0) {
        triggerTrap();
    }
    updateUI();
}

// Trap mechanism with harder question
function triggerTrap() {
    feedbackMessage.innerHTML = "<span class='trap'>Trap triggered! Solve a HARDER question or wait 45 minutes for hearts to reset.</span>";
    fetchMathProblem(level + 2);
    startTrapCountdown();
}

function startTrapCountdown() {
    let trapTimeLeft = 2700;
    const trapTimer = setInterval(() => {
        trapTimeLeft--;
        feedbackMessage.innerHTML = `<span class='trap'>Time until heart reset: ${Math.floor(trapTimeLeft / 60)}m ${trapTimeLeft % 60}s</span>`;
        
        if (trapTimeLeft <= 0) {
            clearInterval(trapTimer);
            resetHearts();
        }
    }, 1000);
}

function resetHearts() {
    hearts = 4;
    feedbackMessage.innerHTML = "<span class='success'>Hearts restored! Try again!</span>";
    updateUI();
    fetchMathProblem();
}

// Timer logic for level completion
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = `Time Left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleWrongAnswer();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = initialTime;
    startTimer();
}

// Leaderboard logic
// leaderboardButton.addEventListener("click", () => {
//     leaderboard.classList.toggle("hidden");
//     populateLeaderboard();
// });

// function populateLeaderboard() {
//     leaderboardList.innerHTML = `<li>Player 1 - Level 5</li><li>Player 2 - Level 3</li><li>You - Level ${level}</li>`;
// }

// .................................270225 New Update

// Show leaderboard when button is clicked
leaderboardButton.addEventListener("click", () => {
    populateLeaderboard();
    leaderboardModal.style.display = "block";
});

// Close leaderboard
closeLeaderboardButton.addEventListener("click", () => {
    leaderboardModal.style.display = "none";
});

// Move to next level
nextLevelButton.addEventListener("click", () => {
    leaderboardModal.style.display = "none";
    fetchMathProblem(level);          // Load next level question
    resetTimer();                     // Reset the timer
    answerInput.value = "";           // Clear the input box
});

// Update leaderboard
function populateLeaderboard() {
    leaderboardList.innerHTML = `
        <li>Player 1 - Level 5</li>
        <li>Player 2 - Level 3</li>
        <li>You - Level ${level}</li>
    `;
}

// Update 270225..........................................






// Stats tracking
function updateStats() {
    const statsDisplay = document.getElementById("player-stats");
    if (!statsDisplay) return;
    
    
    const accuracy = ((correctAnswers / totalAttempts) * 100).toFixed(2);
    statsDisplay.innerHTML = `
        <p>Level: ${level}</p>
        <p>Accuracy: ${accuracy}%</p>
        <p>Treasures: ${treasuresCollected}</p>
    `;
}

// UI management
function updateUI() {
    levelInfo.textContent = `Level: ${level}`;
    heartsDisplay.textContent = `Hearts: ${'❤'.repeat(hearts)}`;
}

function showTreasureAnimation() {
    const treasure = document.getElementById("treasure-chest");
    treasure.classList.remove("hidden");
    playSound('treasure-sound');
    setTimeout(() => treasure.classList.add("hidden"), 2000);
}

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) sound.play();
}

// Guest progression reminder
function checkGuestProgression() {
    if (guestMode && level > 2) {
        setTimeout(() => {
            feedbackMessage.innerHTML = "<span class='login-prompt'>Want to keep playing? Log in to save your progress! 🚀</span>";
        }, 1000);
        clearInterval(timer);
    }
}

// Game initialization
fetchMathProblem();
startTimer();
updateStats();
updateUI()
