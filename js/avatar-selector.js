const AVATAR_PARAMS = {
    topTypes: ['NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban', 'WinterHat1', 'LongHairBigHair'],
    accessories: ['Blank', 'Kurt', 'Prescription01', 'Round', 'Sunglasses', 'Wayfarers'],
    hairColors: ['Auburn', 'Black', 'Blonde', 'Brown', 'PastelPink', 'Platinum', 'Red', 'SilverGray'],
    facialHair: ['Blank', 'BeardMedium', 'MoustacheFancy', 'MoustacheMagnum'],
    clotheTypes: ['BlazerShirt', 'CollarSweater', 'GraphicShirt', 'Hoodie', 'Overall'],
    eyeTypes: ['Default', 'Close', 'Cry', 'Dizzy', 'EyeRoll', 'Happy', 'Hearts', 'Side'],
    mouthTypes: ['Concerned', 'Default', 'Disbelief', 'Eating', 'Grimace', 'Sad', 'ScreamOpen', 'Serious'],
    skinColors: ['Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black']
};

function generateRandomAvatar() {
    const params = new URLSearchParams({
        avatarStyle: 'Circle',
        topType: AVATAR_PARAMS.topTypes[Math.floor(Math.random() * AVATAR_PARAMS.topTypes.length)],
        accessoriesType: AVATAR_PARAMS.accessories[Math.floor(Math.random() * AVATAR_PARAMS.accessories.length)],
        hairColor: AVATAR_PARAMS.hairColors[Math.floor(Math.random() * AVATAR_PARAMS.hairColors.length)],
        facialHairType: AVATAR_PARAMS.facialHair[Math.floor(Math.random() * AVATAR_PARAMS.facialHair.length)],
        clotheType: AVATAR_PARAMS.clotheTypes[Math.floor(Math.random() * AVATAR_PARAMS.clotheTypes.length)],
        eyeType: AVATAR_PARAMS.eyeTypes[Math.floor(Math.random() * AVATAR_PARAMS.eyeTypes.length)],
        mouthType: AVATAR_PARAMS.mouthTypes[Math.floor(Math.random() * AVATAR_PARAMS.mouthTypes.length)],
        skinColor: AVATAR_PARAMS.skinColors[Math.floor(Math.random() * AVATAR_PARAMS.skinColors.length)]
    });

    return `https://avataaars.io/?${params.toString()}`;
}

document.addEventListener('DOMContentLoaded', function () {
    const avatarGrid = document.getElementById('avatar-grid');
    const selectedAvatarInput = document.getElementById('selected-avatar');

    // Function to generate a batch of avatars
    function generateAvatarBatch(count = 4) {
        const avatars = [];
        for (let i = 0; i < count; i++) {
            avatars.push(generateRandomAvatar());
        }
        return avatars;
    }

    // Function to render avatars in the grid
    function renderAvatars(avatars) {
        avatarGrid.innerHTML = ''; // Clear existing avatars
        avatars.forEach((avatarUrl, index) => {
            const avatarElement = document.createElement('div');
            avatarElement.classList.add('avatar-card');
            avatarElement.innerHTML = `
                <img src="${avatarUrl}" alt="Avatar ${index + 1}" class="avatar">
            `;
            avatarElement.addEventListener('click', function () {
                selectAvatar(avatarUrl, avatarElement);
            });
            avatarGrid.appendChild(avatarElement);
        });
    }

    // Function to handle avatar selection
    function selectAvatar(avatarUrl, avatarElement) {
        // Update the hidden input field with the selected avatar URL
        selectedAvatarInput.value = avatarUrl;

        // Remove the 'selected' class from all avatars
        const avatars = document.querySelectorAll('.avatar-card');
        avatars.forEach((avatar) => avatar.classList.remove('selected'));

        // Add the 'selected' class to the clicked avatar
        avatarElement.classList.add('selected');
    }

    // Generate and render initial avatars
    const initialAvatars = generateAvatarBatch();
    renderAvatars(initialAvatars);

    // Event listener for "Show More Pirates" button
    const suggestAvatarsButton = document.getElementById('suggest-avatars');
    suggestAvatarsButton.addEventListener('click', function () {
        const newAvatars = generateAvatarBatch();
        renderAvatars(newAvatars);
    });
});
