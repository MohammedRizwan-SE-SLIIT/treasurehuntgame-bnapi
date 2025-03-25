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
            <td>${entry.rank}</td>
            <td>${entry.display_name}</td>
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

function fetchLeaderboardData() {
    fetch('../php/get_dashboard_data.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const userData = data.userData;
                const userProgress = data.userProgress;
                const leaderboardData = data.leaderboardData;

                // Update user stats
                document.getElementById('pirateName').innerText = userData.display_name || 'Guest';
                document.getElementById('avatar').src = userData.avatar_url || '../assets/default-avatar.png';
                document.getElementById('username').innerText = userData.username || 'Guest';
                document.getElementById('highestLevel').innerText = userProgress.highest_level || 1;
                document.getElementById('totalTreasures').innerText = userProgress.total_treasures || 0;

                // Render leaderboard and setup pagination
                renderLeaderboard(leaderboardData);
                setupPagination(leaderboardData);
            } else {
                console.error('Error fetching leaderboard data:', data.error);
            }
        })
        .catch(error => {
            console.error('Error fetching leaderboard data:', error);
        });
}

function logout() {
    // Clear localStorage and redirect to login page
    localStorage.removeItem('displayName');
    localStorage.removeItem('avatarUrl');
    localStorage.removeItem('username');
    localStorage.removeItem('highestLevel');
    localStorage.removeItem('totalTreasures');
    localStorage.setItem('guestMode', 'true');
    window.location.href = "../html/auth.html";
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLeaderboardData();
    setInterval(fetchLeaderboardData, 5000); // Refresh leaderboard every 5 seconds
});

