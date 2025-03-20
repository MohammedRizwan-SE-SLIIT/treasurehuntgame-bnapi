document.addEventListener('DOMContentLoaded', function () {
    function fetchLeaderboardData() {
       
        const userData = {
            username: localStorage.getItem('username') || 'Guest',
            display_name: localStorage.getItem('displayName') || 'Guest',
            avatar_url: localStorage.getItem('avatarUrl') || '../assets/default-avatar.png',
        };

       
        const userProgress = {
            highest_level: localStorage.getItem('highestLevel') || 1,
            total_treasures: localStorage.getItem('totalTreasures') || 0,
        };

      
        const leaderboardData = [
            { display_name: 'Player1', highest_level: 10, total_treasures: 100 },
            { display_name: 'Player2', highest_level: 8, total_treasures: 80 },
            { display_name: userData.display_name, highest_level: userProgress.highest_level, total_treasures: userProgress.total_treasures },
        ];

       
        document.getElementById('pirateName').innerText = userData.display_name;
        document.getElementById('avatar').src = userData.avatar_url;
        document.getElementById('username').innerText = userData.username;
        document.getElementById('highestLevel').innerText = userProgress.highest_level;
        document.getElementById('totalTreasures').innerText = userProgress.total_treasures;

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
    }

    fetchLeaderboardData();

   
    setInterval(fetchLeaderboardData, 5000);
});


function startGame() {
    window.location.href = "../html/game.html";
}


function logout() {
 
    localStorage.removeItem('displayName');
    localStorage.removeItem('avatarUrl');
    localStorage.removeItem('username');
    localStorage.removeItem('highestLevel');
    localStorage.removeItem('totalTreasures');
    localStorage.setItem('guestMode', 'true');
    window.location.href = "../html/auth.html";
}
