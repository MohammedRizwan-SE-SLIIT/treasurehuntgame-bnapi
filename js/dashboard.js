document.addEventListener('DOMContentLoaded', function() {
    function fetchLeaderboardData() {
        fetch('../php/get_dashboard_data.php')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const userData = data.userData;
                    const userProgress = data.userProgress;
                    const leaderboardData = data.leaderboardData;

                    document.getElementById('pirateName').innerText = userData.display_name || 'Guest';
                    document.getElementById('avatar').src = userData.avatar_url || '../assets/default-avatar.png';
                    document.getElementById('username').innerText = userData.username || 'Guest';
                    document.getElementById('highestLevel').innerText = userProgress.highest_level || 1;
                    document.getElementById('totalTreasures').innerText = userProgress.total_treasures || 0;

                    const leaderboardTable = document.getElementById('leaderboardData');
                    leaderboardTable.innerHTML = '';
                    leaderboardData.forEach((entry, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${index + 1}</td>
                            <td>${entry.display_name}</td>
                            <td>${entry.highest_level}</td>
                            <td>${entry.total_treasures}</td>
                        `;
                        leaderboardTable.appendChild(row);
                    });

                    // Highlight current player's achievements
                    const currentPlayerRow = document.createElement('tr');
                    currentPlayerRow.classList.add('highlight');
                    currentPlayerRow.innerHTML = `
                        <td>${leaderboardData.findIndex(entry => entry.username === userData.username) + 1}</td>
                        <td>${userData.display_name}</td>
                        <td>${userProgress.highest_level || 1}</td>
                        <td>${userProgress.total_treasures || 0}</td>
                    `;
                    leaderboardTable.insertBefore(currentPlayerRow, leaderboardTable.firstChild);
                } else {
                    console.error('Error fetching dashboard data:', data.error);
                    if (data.error === 'Authentication required') {
                        window.location.href = '../html/auth.html';
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching dashboard data:', error);
            });
    }

    fetchLeaderboardData();
    setInterval(fetchLeaderboardData, 5000); // Refresh leaderboard every 5 seconds
});

// Start a new game
function startGame() {
    window.location.href = "../html/game.html";
}

// Logout functionality
function logout() {
    // Clear localStorage and redirect to login page
    localStorage.removeItem('displayName');
    localStorage.removeItem('avatarUrl');
    localStorage.removeItem('username');
    localStorage.setItem('guestMode', 'true');
    window.location.href = "../html/auth.html";
}
