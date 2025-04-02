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
            <td>${entry.rank || index + 1}</td> <!-- Use rank if available, otherwise fallback to index -->
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

function fetchDashboardData() {
    const jwtToken = localStorage.getItem('jwt'); // Retrieve the JWT token from localStorage

    if (!jwtToken) {
        console.error('Authentication required: No JWT token found.');
        showAuthError("You are not logged in. Please log in to access the dashboard.");
        return;
    }

    fetch('../php/get_dashboard_data.php', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${jwtToken}`, // Include the JWT token in the Authorization header
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Render leaderboard
                renderLeaderboard(data.leaderboardData);
                setupPagination(data.leaderboardData);

                // Update user stats
                document.getElementById('username').textContent = data.userData.username || 'Guest';
                document.getElementById('highestLevel').textContent = data.userProgress.highest_level || 1;
                document.getElementById('totalTreasures').textContent = data.userProgress.total_treasures || 0;
            } else {
                console.error('Error fetching dashboard data:', data.error);
            }
        })
        .catch(error => {
            console.error('Error fetching dashboard data:', error);
        });
}

function logout() {
    localStorage.clear();
    window.location.href = 'auth.html';
}

document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
});

