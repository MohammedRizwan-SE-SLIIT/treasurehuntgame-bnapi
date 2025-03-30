const AVATAR_PARAMS = {
    topTypes: ['NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban', 'WinterHat1', 'LongHairBigHair'],
    accessories: ['Blank', 'Kurt', 'Prescription01', 'Round', 'Sunglasses', 'Wayfarers'],
    hairColors: ['Auburn', 'Black', 'Blonde', 'Brown', 'PastelPink', 'Platinum', 'Red', 'SilverGray'],
    facialHair: ['Blank', 'BeardMedium', 'MoustacheFancy', 'MoustacheMagnum']
};

function generateRandomAvatar() {
    const params = new URLSearchParams({
        avatarStyle: 'Circle',
        topType: AVATAR_PARAMS.topTypes[Math.floor(Math.random() * AVATAR_PARAMS.topTypes.length)],
        accessoriesType: AVATAR_PARAMS.accessories[Math.floor(Math.random() * AVATAR_PARAMS.accessories.length)],
        hairColor: AVATAR_PARAMS.hairColors[Math.floor(Math.random() * AVATAR_PARAMS.hairColors.length)],
        facialHairType: AVATAR_PARAMS.facialHair[Math.floor(Math.random() * AVATAR_PARAMS.facialHair.length)],
        clotheType: ['BlazerShirt', 'CollarSweater', 'GraphicShirt', 'Hoodie', 'Overall'][Math.floor(Math.random() * 5)],
        eyeType: ['Default', 'Close', 'Cry', 'Dizzy', 'EyeRoll', 'Happy', 'Hearts', 'Side'][Math.floor(Math.random() * 8)],
        mouthType: ['Concerned', 'Default', 'Disbelief', 'Eating', 'Grimace', 'Sad', 'ScreamOpen', 'Serious'][Math.floor(Math.random() * 8)],
        skinColor: ['Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black'][Math.floor(Math.random() * 7)]
    });
    
    return `https://avataaars.io/?${params.toString()}`;
}

let suggestedAvatars = [];

function generateAvatarBatch() {
    const batch = [];
    for (let i = 0; i < 6; i++) {
        batch.push(generateRandomAvatar());
    }
    return batch;
}

function showAvatarSuggestions() {
    suggestedAvatars = [...suggestedAvatars, ...generateAvatarBatch()];
    const container = document.getElementById('avatar-grid');
    container.innerHTML = '';
    
    suggestedAvatars.slice(-12).forEach((url, index) => {
        const avatarCard = document.createElement('div');
        avatarCard.className = 'avatar-card';
        avatarCard.innerHTML = `
            <img src="${url}" alt="Avatar ${index + 1}" onclick="selectAvatar(this)">
            <button onclick="saveAvatar('${url}')">Choose Pirate</button>
        `;
        container.appendChild(avatarCard);
    });
}

function selectAvatar(element) {
    document.querySelectorAll('.avatar-card img').forEach(img => 
        img.classList.remove('selected'));
    element.classList.add('selected');
}

function saveAvatar(url) {
    localStorage.setItem('selectedAvatar', url);
    document.getElementById('avatar-preview').src = url;
}
