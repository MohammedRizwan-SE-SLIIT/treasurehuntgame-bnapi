document.addEventListener("DOMContentLoaded", function () {
    const avatarGrid = document.getElementById("avatar-grid");
    const suggestAvatarsButton = document.getElementById("suggest-avatars");
    const selectedAvatarInput = document.getElementById("selected-avatar");

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
            skinColor: AVATAR_PARAMS.skinColors[Math.floor(Math.random() * AVATAR_PARAMS.skinColors.length)],
            randomSeed: Math.random().toString(36).substring(2) // Generate a unique random seed
        });

        return `https://avataaars.io/?${params.toString()}`;
    }

    function generateRandomAvatars(count = 4) {
        avatarGrid.innerHTML = ""; // Clear existing avatars
        for (let i = 0; i < count; i++) {
            const avatarUrl = generateRandomAvatar();
            const avatarCard = document.createElement("div");
            avatarCard.className = "avatar-card";
            const avatarImage = document.createElement("img");
            avatarImage.src = avatarUrl;
            avatarImage.alt = "Pirate Avatar";
            avatarImage.addEventListener("click", () => selectAvatar(avatarUrl)); // Bind click event
            avatarCard.appendChild(avatarImage);
            avatarGrid.appendChild(avatarCard);
        }
    }

    function selectAvatar(url) {
        document.querySelectorAll(".avatar-card img").forEach((img) => img.classList.remove("selected"));
        const selectedImage = document.querySelector(`img[src="${url}"]`);
        if (selectedImage) {
            selectedImage.classList.add("selected");
        }
        selectedAvatarInput.value = url; // Update the hidden input field
    }

    suggestAvatarsButton.addEventListener("click", () => generateRandomAvatars(4));

    // Expose the function to the global scope
    window.generateRandomAvatars = generateRandomAvatars;

    // Generate initial avatars
    generateRandomAvatars();
});
