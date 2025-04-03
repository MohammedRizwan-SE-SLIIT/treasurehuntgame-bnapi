let currentPage = 1;
const rowsPerPage = 10;

function renderLeaderboard(data) {
    const leaderboardTable = document.getElementById('leaderboardData');
    leaderboardTable.innerHTML = '';

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.rank || start + index + 1}</td> <!-- Use rank if available -->
            <td>${entry.username}</td>
            <td>${entry.highest_level}</td>
            <td>${entry.total_treasures}</td>
        `;
        leaderboardTable.appendChild(row);
    });
}

function setupPagination(data) {
    const totalPages = Math.ceil(data.length / rowsPerPage);
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.classList.add('pagination-button');
        if (i === currentPage) button.classList.add('active');
        button.addEventListener('click', () => {
            currentPage = i;
            renderLeaderboard(data);
        });
        paginationContainer.appendChild(button);
    }
}

function fetchLeaderboard() {
    fetch('../php/get_leaderboard.php', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('Leaderboard Data:', data); // Log the response for debugging
            if (data.success) {
                renderLeaderboard(data.leaderboardData);
                setupPagination(data.leaderboardData);
            } else {
                console.error('Error fetching leaderboard data:', data.error);
                alert("Failed to fetch leaderboard data. Please try again.");
            }
        })
        .catch(error => {
            console.error('Error fetching leaderboard data:', error);
            alert("An error occurred while fetching leaderboard data. Please try again.");
        });
}

function refreshLeaderboard() {
    fetch('../php/get_leaderboard.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderLeaderboard(data.leaderboardData);
                setupPagination(data.leaderboardData);
            } else {
                console.error('Error refreshing leaderboard:', data.error);
            }
        })
        .catch(error => {
            console.error('Error refreshing leaderboard:', error);
        });
}

// Example: Trigger leaderboard refresh after a score update
document.addEventListener('scoreUpdated', refreshLeaderboard);

function updateProfileContainer() {
    const guestMode = localStorage.getItem('guestMode') === 'true';
    const username = guestMode ? 'Guest' : localStorage.getItem('username') || 'Guest';
    const avatarUrl = guestMode
        ? '../assets/default-avatar.png'
        : localStorage.getItem('avatarUrl') || '../assets/default-avatar.png';

    document.getElementById('pirateName').textContent = username;
    document.getElementById('avatar').src = avatarUrl;
}

function startNewGame() {
    window.location.href = "../html/game.html"; // Redirect to game.html
}

function logout() {
    localStorage.clear();
    window.location.href = 'auth.html';
}

document.addEventListener('DOMContentLoaded', () => {
    updateProfileContainer(); // Update profile container from localStorage
    fetchLeaderboard(); // Fetch leaderboard data

    document.getElementById('logoutButton').addEventListener('click', logout);

    // Add event listener for the "Start New Game" button
    const startGameButton = document.getElementById('startGameButton');
    if (startGameButton) {
        startGameButton.addEventListener('click', startNewGame);
    }
});

