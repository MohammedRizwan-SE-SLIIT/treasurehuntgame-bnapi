// game.js (with leaderboard, guest limits, animations, and rewards)

const apiUrl = 'https://marcconrad.com/uob/banana/';
let level = 1;
let hearts = 4;
const initialTime = 60;
let timeLeft = initialTime;
let score = 0;
let guestMode = true;

const levelInfo = document.getElementById("level-info");
const heartsDisplay = document.getElementById("lives");
const timerDisplay = document.getElementById("timer");
const feedbackMessage = document.getElementById("feedback-message");
const questionImage = document.getElementById("math-image");
const answerInput = document.getElementById("answer-input");
const submitButton = document.getElementById("submit-answer");
const leaderboard = document.getElementById("leaderboard");
const leaderboardList = document.getElementById("leaderboard-list");
const treasureChest = document.getElementById("treasure-chest");

// Fetch math problem
async function fetchMathProblem() {
    try {
        const response = await fetch(`${apiUrl}?difficulty=${level}`);
        const data = await response.json();
        questionImage.src = data.question;
        questionImage.alt = 'Math Problem';
        questionImage.dataset.answer = data.answer;
    } catch (error) {
        console.error('Error fetching math problem:', error);
    }
}

// Handle answer submission
submitButton.addEventListener("click", () => {
    checkAnswer();
});

function checkAnswer() {
    const playerAnswer = answerInput.value.trim();
    const correctAnswer = questionImage.dataset.answer;

    if (playerAnswer === correctAnswer) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }
}

function handleCorrectAnswer() {
    feedbackMessage.textContent = "Correct! 🎉 Treasure Found!";
    feedbackMessage.className = "success bounce";
    score += 10 * level;
    treasureChest.classList.remove("hidden");
    setTimeout(() => treasureChest.classList.add("hidden"), 2000);

    level++;
    resetTimer();
    fetchMathProblem();
}

function handleWrongAnswer() {
    hearts--;
    feedbackMessage.textContent = `Wrong! ${hearts} hearts left. Keep digging! 🪓`;
    feedbackMessage.className = "error shake";

    if (hearts === 0) {
        triggerTrap();
    }
    updateUI();
}

function triggerTrap() {
    feedbackMessage.textContent = "Trap triggered! Harder problem or wait 45 mins.";
    feedbackMessage.className = "trap flash";
    setTimeout(() => {
        level += 2;
        hearts = 4;
        fetchMathProblem();
        resetTimer();
    }, 3000);
}

// Timer management
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

// Guest mode check
function checkGuestMode() {
    if (guestMode && level > 2) {
        clearInterval(timer);
        feedbackMessage.textContent = "Guest limit reached! Log in to continue the adventure!";
        feedbackMessage.className = "warning pulse";
        submitButton.disabled = true;
    }
}

// Update UI
function updateUI() {
    levelInfo.textContent = `Level: ${level}`;
    heartsDisplay.textContent = `Hearts: ${'❤'.repeat(hearts)}`;
    checkGuestMode();
}

// Initialize game
fetchMathProblem();
startTimer();
updateUI();
