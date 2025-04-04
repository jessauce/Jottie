// Profile management functionality
export function initProfile() {
    loadProfileFromStorage();
    setupProfileEvents();
}

// Load profile data from localStorage
function loadProfileFromStorage() {
    const profileData = JSON.parse(localStorage.getItem('jottieProfile')) || {};
    
    // Set form values
    if (profileData.name) document.getElementById('profile-name').value = profileData.name;
    if (profileData.username) document.getElementById('profile-username').value = profileData.username;
    if (profileData.email) document.getElementById('profile-email').value = profileData.email;
    if (profileData.bio) document.getElementById('profile-bio').value = profileData.bio;
    if (profileData.theme) {
        document.getElementById(`theme-${profileData.theme}`).checked = true;
        document.body.setAttribute('data-theme', profileData.theme);
    }
    
    // Set profile image if exists
    if (profileData.profileImage) {
        document.getElementById('profile-image-preview').src = profileData.profileImage;
        document.getElementById('sidebar-profile-image').src = profileData.profileImage;
        document.getElementById('sidebar-profile-image').style.display = 'block';
        document.getElementById('sidebar-initials').style.display = 'none';
    } else {
        updateInitials(profileData.name);
    }
    
    // Update sidebar info
    updateSidebarInfo(profileData);
}

// Set up event listeners for profile functionality
function setupProfileEvents() {
    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfile();
    });
    
    // Profile image change
    const changeImageBtn = document.getElementById('change-profile-image');
    const imageInput = document.getElementById('profile-image-input');
    
    changeImageBtn.addEventListener('click', function() {
        imageInput.click();
    });
    
    imageInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const imagePreview = document.getElementById('profile-image-preview');
                imagePreview.src = e.target.result;
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // Theme change
    const themeOptions = document.querySelectorAll('input[name="theme"]');
    themeOptions.forEach(option => {
        option.addEventListener('change', function() {
            document.body.setAttribute('data-theme', this.value);
        });
    });
}

// Save profile data to localStorage
function saveProfile() {
    const name = document.getElementById('profile-name').value;
    const username = document.getElementById('profile-username').value;
    const email = document.getElementById('profile-email').value;
    const bio = document.getElementById('profile-bio').value;
    const profileImage = document.getElementById('profile-image-preview').src;
    const theme = document.querySelector('input[name="theme"]:checked').value;
    
    const profileData = {
        name,
        username,
        email,
        bio,
        profileImage,
        theme
    };
    
    // Save to localStorage
    localStorage.setItem('jottieProfile', JSON.stringify(profileData));
    
    // Update sidebar information
    updateSidebarInfo(profileData);
    
    // Show success message
    showNotification('Profile saved successfully');
}

// Update sidebar with profile information
function updateSidebarInfo(profileData) {
    const sidebarUsername = document.getElementById('sidebar-username');
    const sidebarEmail = document.getElementById('sidebar-email');
    const sidebarProfileImage = document.getElementById('sidebar-profile-image');
    const sidebarInitials = document.getElementById('sidebar-initials');
    
    // Update text information
    sidebarUsername.textContent = profileData.username || 'Username';
    // sidebarEmail.textContent = profileData.email || 'email@example.com';
    
    // Update profile image
    if (profileData.profileImage) {
        sidebarProfileImage.src = profileData.profileImage;
        sidebarProfileImage.style.display = 'block';
        sidebarInitials.style.display = 'none';
    } else {
        sidebarProfileImage.style.display = 'none';
        sidebarInitials.style.display = 'block';
        updateInitials(profileData.name);
    }
}

// Generate and update initials from name
function updateInitials(name) {
    const initialsElement = document.getElementById('sidebar-initials');
    
    if (name) {
        const nameParts = name.split(' ').filter(part => part.length > 0);
        if (nameParts.length >= 2) {
            initialsElement.textContent = nameParts[0][0] + nameParts[1][0];
        } else if (nameParts.length === 1) {
            initialsElement.textContent = nameParts[0][0];
        } else {
            initialsElement.textContent = 'JJ';
        }
    } else {
        initialsElement.textContent = 'JJ';
    }
}

// Display notification
function showNotification(message) {
    // Check if notification container exists, create if not
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}