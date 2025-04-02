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

document.addEventListener('DOMContentLoaded', function () {
    function initializeDashboard() {
        const username = localStorage.getItem('username');
        const jwtToken = localStorage.getItem('jwt');
        const guestMode = localStorage.getItem('guestMode') === 'true';

        // Update profile UI
        const pirateNameElement = document.getElementById('pirateName');
        const avatarElement = document.getElementById('avatar');

        if (guestMode || !jwtToken || !username) {
            pirateNameElement.textContent = 'Guest';
            avatarElement.src = '../assets/default-avatar.png';
        } else {
            pirateNameElement.textContent = username;
            avatarElement.src = `../assets/avatars/${username}.png`; // Example: Use a specific avatar for logged-in users
        }
    }

    function fetchLeaderboardData() {
        const jwtToken = localStorage.getItem('jwt'); // Retrieve the JWT token from localStorage

        if (!jwtToken) {
            console.error('Authentication required: No JWT token found.');
            showAuthError("You are not logged in. Please log in to access the dashboard.");
            return;
        }

        console.log("JWT Token Sent:", jwtToken); // Debugging log

        fetch('../php/get_dashboard_data.php', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`, // Include the JWT token in the Authorization header
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                console.log("Response Status:", response.status); // Log the response status
                return response.text(); // Read the response as text for debugging
            })
            .then(text => {
                try {
                    const data = JSON.parse(text); // Attempt to parse the response as JSON
                    if (data.success) {
                        console.log("Leaderboard Data:", data); // Debugging log
                        renderLeaderboard(data.leaderboardData);
                        setupPagination(data.leaderboardData);

                        // Update user stats
                        document.getElementById('username').textContent = data.userData.username || 'Guest';
                        document.getElementById('highestLevel').textContent = data.userProgress.highest_level || 1;
                        document.getElementById('totalTreasures').textContent = data.userProgress.total_treasures || 0;
                    } else {
                        console.error('Error fetching dashboard data:', data.error);
                    }
                } catch (error) {
                    console.error("Error parsing JSON:", error, "Response Text:", text);
                }
            })
            .catch(error => {
                console.error('Error fetching leaderboard data:', error);
            });
    }

    function showAuthError(message) {
        const errorContainer = document.createElement('div');
        errorContainer.style.position = 'fixed';
        errorContainer.style.top = '0';
        errorContainer.style.left = '0';
        errorContainer.style.width = '100%';
        errorContainer.style.height = '100%';
        errorContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        errorContainer.style.color = '#fff';
        errorContainer.style.display = 'flex';
        errorContainer.style.flexDirection = 'column';
        errorContainer.style.alignItems = 'center';
        errorContainer.style.justifyContent = 'center';
        errorContainer.style.zIndex = '1000';

        const errorMessage = document.createElement('p');
        errorMessage.textContent = message;
        errorMessage.style.fontSize = '1.5rem';
        errorMessage.style.marginBottom = '20px';

        const loginButton = document.createElement('button');
        loginButton.textContent = 'Log In';
        loginButton.style.padding = '10px 20px';
        loginButton.style.backgroundColor = '#d4af37';
        loginButton.style.color = '#000';
        loginButton.style.border = 'none';
        loginButton.style.borderRadius = '5px';
        loginButton.style.cursor = 'pointer';
        loginButton.addEventListener('click', () => {
            window.location.href = '../html/auth.html';
        });

        errorContainer.appendChild(errorMessage);
        errorContainer.appendChild(loginButton);
        document.body.appendChild(errorContainer);
    }

    initializeDashboard(); // Initialize the dashboard UI
    fetchLeaderboardData(); // Fetch leaderboard data
    setInterval(fetchLeaderboardData, 5000); // Refresh leaderboard every 5 seconds
});

