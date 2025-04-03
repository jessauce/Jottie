// Settings page functionality
export function initSettings() {
    setupThemeToggle();
    setupFontSizeSelector();
    setupNotificationToggles();
    setupDataManagement();
    setupInstallApp();
    setupAdvancedSettings();
}

// Theme toggle functionality
function setupThemeToggle() {
    const themeToggleSwitch = document.getElementById('theme-toggle-switch');
    const themeLabel = document.getElementById('theme-label');
    
    // Load saved theme preference
    const profileData = JSON.parse(localStorage.getItem('jottieProfile')) || {};
    const currentTheme = profileData.theme || 'light';
    
    // Set initial toggle state based on current theme
    themeToggleSwitch.checked = currentTheme === 'dark';
    themeLabel.textContent = currentTheme === 'dark' ? 'Dark' : 'Light';
    
    // Update theme when toggle is switched
    themeToggleSwitch.addEventListener('change', function() {
        const newTheme = this.checked ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        themeLabel.textContent = newTheme === 'dark' ? 'Dark' : 'Light';
        
        // Also update the theme in profile settings
        const profileData = JSON.parse(localStorage.getItem('jottieProfile')) || {};
        profileData.theme = newTheme;
        localStorage.setItem('jottieProfile', JSON.stringify(profileData));
        
        // Update radio buttons in profile page
        const themeRadio = document.getElementById(`theme-${newTheme}`);
        if (themeRadio) themeRadio.checked = true;
        
        showNotification(`Theme changed to ${newTheme} mode`);
    });
}

// Font size selector functionality
function setupFontSizeSelector() {
    const fontSizeSelector = document.getElementById('font-size-selector');
    
    // Load saved font size preference
    const savedFontSize = localStorage.getItem('jottieFontSize') || 'medium';
    fontSizeSelector.value = savedFontSize;
    
    // Apply font size to body
    document.body.classList.add(`font-size-${savedFontSize}`);
    
    // Update font size when selection changes
    fontSizeSelector.addEventListener('change', function() {
        const newFontSize = this.value;
        
        // Remove all font size classes
        document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
        
        // Add the selected font size class
        document.body.classList.add(`font-size-${newFontSize}`);
        
        // Save preference
        localStorage.setItem('jottieFontSize', newFontSize);
        
        showNotification(`Font size changed to ${newFontSize}`);
    });
}

// Notification settings functionality
function setupNotificationToggles() {
    const eventNotificationsSwitch = document.getElementById('event-notifications-switch');
    const taskNotificationsSwitch = document.getElementById('task-notifications-switch');
    
    // Load saved notification preferences
    const notificationSettings = JSON.parse(localStorage.getItem('jottieNotifications')) || {
        events: true,
        tasks: true
    };
    
    // Set initial toggle states
    eventNotificationsSwitch.checked = notificationSettings.events;
    taskNotificationsSwitch.checked = notificationSettings.tasks;
    
    // Update event notification settings
    eventNotificationsSwitch.addEventListener('change', function() {
        notificationSettings.events = this.checked;
        localStorage.setItem('jottieNotifications', JSON.stringify(notificationSettings));
        showNotification(this.checked ? 'Event reminders enabled' : 'Event reminders disabled');
    });
    
    // Update task notification settings
    taskNotificationsSwitch.addEventListener('change', function() {
        notificationSettings.tasks = this.checked;
        localStorage.setItem('jottieNotifications', JSON.stringify(notificationSettings));
        showNotification(this.checked ? 'Task reminders enabled' : 'Task reminders disabled');
    });
}

// Data management functionality
function setupDataManagement() {
    const backupDataBtn = document.getElementById('backup-data-btn');
    const restoreDataBtn = document.getElementById('restore-data-btn');
    const restoreFileInput = document.getElementById('restore-file-input');
    const emailBackupBtn = document.getElementById('email-backup-btn');
    
    // Backup all data
    backupDataBtn.addEventListener('click', function() {
        // Collect all data from localStorage
        const backupData = {
            events: JSON.parse(localStorage.getItem('events')) || [],
            todos: JSON.parse(localStorage.getItem('todos')) || [],
            subjects: JSON.parse(localStorage.getItem('subjects')) || [],
            profile: JSON.parse(localStorage.getItem('jottieProfile')) || {},
            settings: {
                notifications: JSON.parse(localStorage.getItem('jottieNotifications')) || {},
                fontSize: localStorage.getItem('jottieFontSize') || 'medium'
            },
            timestamp: new Date().toISOString()
        };
        
        // Convert to JSON string
        const backupJSON = JSON.stringify(backupData, null, 2);
        
        // Create and download backup file
        const blob = new Blob([backupJSON], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `jottie-backup-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Backup created successfully');
    });
    
    // Restore data from file
    restoreDataBtn.addEventListener('click', function() {
        restoreFileInput.click();
    });
    
    restoreFileInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const backupData = JSON.parse(e.target.result);
                    
                    // Confirm restore action
                    showConfirmationModal(
                        'Restore Data',
                        'This will replace all your current data with the backup. Continue?',
                        function() {
                            // Restore the data
                            if (backupData.events) localStorage.setItem('events', JSON.stringify(backupData.events));
                            if (backupData.todos) localStorage.setItem('todos', JSON.stringify(backupData.todos));
                            if (backupData.subjects) localStorage.setItem('subjects', JSON.stringify(backupData.subjects));
                            if (backupData.profile) localStorage.setItem('jottieProfile', JSON.stringify(backupData.profile));
                            
                            if (backupData.settings) {
                                if (backupData.settings.notifications) {
                                    localStorage.setItem('jottieNotifications', JSON.stringify(backupData.settings.notifications));
                                }
                                if (backupData.settings.fontSize) {
                                    localStorage.setItem('jottieFontSize', backupData.settings.fontSize);
                                }
                            }
                            
                            showNotification('Data restored successfully. Refreshing page...');
                            
                            // Refresh the page to apply changes
                            setTimeout(() => {
                                window.location.reload();
                            }, 1500);
                        }
                    );
                } catch (error) {
                    showNotification('Error: Invalid backup file', 'error');
                    console.error('Error parsing backup file:', error);
                }
            };
            
            reader.readAsText(file);
        }
    });
    
    // Email backup with EmailJS
    emailBackupBtn.addEventListener('click', function() {
        // Check if user has set up email
        const profileData = JSON.parse(localStorage.getItem('jottieProfile')) || {};
        const userEmail = profileData.email;
        
        if (!userEmail) {
            showNotification('Please set up your email in profile settings first', 'warning');
            return;
        }
        
        // Check if EmailJS is available
        if (typeof emailjs === 'undefined') {
            showNotification('Email service is not available. Please make sure EmailJS is properly set up.', 'error');
            return;
        }
        
        // Show processing notification
        showNotification('Preparing backup email...', 'info');
        
        // Disable button to prevent multiple clicks
        emailBackupBtn.disabled = true;
        emailBackupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Create backup data
        const backupData = {
            events: JSON.parse(localStorage.getItem('events')) || [],
            todos: JSON.parse(localStorage.getItem('todos')) || [],
            subjects: JSON.parse(localStorage.getItem('subjects')) || [],
            profile: JSON.parse(localStorage.getItem('jottieProfile')) || {},
            settings: {
                notifications: JSON.parse(localStorage.getItem('jottieNotifications')) || {},
                fontSize: localStorage.getItem('jottieFontSize') || 'medium'
            },
            timestamp: new Date().toISOString()
        };
        
        // Convert to JSON string
        const backupJSON = JSON.stringify(backupData);
        
        // Prepare parameters for EmailJS
        const params = {
            to_email: userEmail,
            user_name: profileData.name || 'User',
            message: `Backup data from Jottie App (${new Date().toLocaleString()})`,
            backup_data: backupJSON
        };
        
        // Send email using EmailJS
        emailjs.send('service_jottie', 'template_g5rgqfn', params, 'C9WF2h7OUsd47xWKu')
            .then(function() {
                showNotification(`Backup email sent to ${userEmail} successfully!`);
            })
            .catch(function(error) {
                console.error('EmailJS error:', error);
                showNotification('Failed to send backup email. Please try again later.', 'error');
            })
            .finally(function() {
                // Reset button state
                emailBackupBtn.disabled = false;
                emailBackupBtn.innerHTML = '<i class="fas fa-envelope"></i> Email Backup';
            });
    });
}

// Install app functionality (PWA)
function setupInstallApp() {
    const installAppBtn = document.getElementById('install-app-btn');
    const pwaStatusMessage = document.getElementById('pwa-status-message');
    let deferredPrompt;
    
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Update UI to show the install button
        installAppBtn.style.display = 'block';
        pwaStatusMessage.innerHTML = '<p>Jottie can be installed as an app on your device for offline access.</p>';
    });
    
    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
        // Hide the install button if app is installed
        installAppBtn.style.display = 'none';
        pwaStatusMessage.innerHTML = '<p>Jottie is installed as an app on your device!</p>';
        deferredPrompt = null;
    });
    
    // Handle installation click
    installAppBtn.addEventListener('click', () => {
        if (!deferredPrompt) {
            // If not supported or already installed, show info
            if (window.matchMedia('(display-mode: standalone)').matches) {
                showNotification('Jottie is already installed as an app');
            } else {
                showNotification('App installation not supported on this browser', 'info');
            }
            return;
        }
        
        // Show the installation prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                showNotification('Jottie is being installed');
            } else {
                showNotification('App installation cancelled');
            }
            deferredPrompt = null;
        });
    });
    
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
        installAppBtn.style.display = 'none';
        pwaStatusMessage.innerHTML = '<p>Jottie is installed as an app on your device!</p>';
    }
}

// Advanced settings functionality (clear data)
function setupAdvancedSettings() {
    const clearDataBtn = document.getElementById('clear-data-btn');
    
    clearDataBtn.addEventListener('click', function() {
        showConfirmationModal(
            'Clear All Data',
            'This will permanently delete all your data and cannot be undone. Are you sure you want to continue?',
            function() {
                // List of keys to remove (excluding potential third-party keys)
                const jottieKeys = [
                    'events',
                    'todos',
                    'subjects',
                    'jottieProfile',
                    'jottieNotifications',
                    'jottieFontSize'
                ];
                
                // Remove all Jottie data
                jottieKeys.forEach(key => {
                    localStorage.removeItem(key);
                });
                
                showNotification('All data cleared successfully. Refreshing page...');
                
                // Refresh the page
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            }
        );
    });
}

// Show confirmation modal
function showConfirmationModal(title, message, confirmCallback) {
    const modal = document.getElementById('confirmation-modal');
    const titleElement = document.getElementById('confirmation-title');
    const messageElement = document.getElementById('confirmation-message');
    const confirmButton = document.getElementById('confirm-action-btn');
    
    // Set modal content
    titleElement.textContent = title;
    messageElement.textContent = message;
    
    // Show modal
    modal.style.display = 'flex';
    
    // Set up confirm button
    confirmButton.onclick = function() {
        confirmCallback();
        modal.style.display = 'none';
    };
    
    // Set up close buttons
    document.querySelectorAll('.close, .close-modal').forEach(button => {
        button.onclick = function() {
            modal.style.display = 'none';
        };
    });
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Notification function (reusing from profile.js)
function showNotification(message, type = 'success') {
    // Check if notification container exists, create if not
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Set icon based on notification type
    let icon;
    switch (type) {
        case 'error':
            icon = 'fa-times-circle';
            break;
        case 'warning':
            icon = 'fa-exclamation-triangle';
            break;
        case 'info':
            icon = 'fa-info-circle';
            break;
        default: // success
            icon = 'fa-check-circle';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${icon}"></i>
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

document.addEventListener("DOMContentLoaded", function () {
    // PWA Installation
    let deferredPrompt;
    const installButton = document.getElementById("install-app-btn");
    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredPrompt = event;
        installButton.style.display = "block";
        installButton.addEventListener("click", () => {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choice) => {
                if (choice.outcome === "accepted") {
                    console.log("PWA Installed");
                }
                deferredPrompt = null;
            });
        });
    });

    // Backup Data
    document.getElementById("backup-data-btn").addEventListener("click", function () {
        const data = JSON.stringify(localStorage);
        const blob = new Blob([data], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "jottie_backup.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Restore Data
    document.getElementById("restore-data-btn").addEventListener("click", function () {
        document.getElementById("restore-file-input").click();
    });

    document.getElementById("restore-file-input").addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                try {
                    const restoredData = JSON.parse(e.target.result);
                    Object.keys(restoredData).forEach((key) => {
                        localStorage.setItem(key, restoredData[key]);
                    });
                    alert("Data restored successfully!");
                } catch (error) {
                    alert("Invalid backup file!");
                }
            };
            reader.readAsText(file);
        }
    });

    // Email Backup
    document.getElementById("email-backup-btn").addEventListener("click", function () {
        const emailData = JSON.stringify(localStorage);
        emailjs.send("your_service_id", "your_template_id", {
            message: emailData,
        }).then(
            () => alert("Backup sent to your email!"),
            (error) => alert("Email backup failed: " + error.text)
        );
    });

    // Theme Toggle
    const themeToggle = document.getElementById("theme-toggle-switch");
    const themeLabel = document.getElementById("theme-label");
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.checked = true;
        themeLabel.textContent = "Dark";
    }
    themeToggle.addEventListener("change", function () {
        if (this.checked) {
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
            themeLabel.textContent = "Dark";
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
            themeLabel.textContent = "Light";
        }
    });

    // Font Size Change
    const fontSizeSelector = document.getElementById("font-size-selector");
    fontSizeSelector.value = localStorage.getItem("fontSize") || "medium";
    document.body.style.fontSize = fontSizeSelector.value;
    fontSizeSelector.addEventListener("change", function () {
        localStorage.setItem("fontSize", this.value);
        document.body.style.fontSize = this.value;
    });

    // Notification Toggle
    ["event-notifications-switch", "task-notifications-switch"].forEach((id) => {
        const toggle = document.getElementById(id);
        toggle.checked = localStorage.getItem(id) === "true";
        toggle.addEventListener("change", function () {
            localStorage.setItem(id, this.checked);
        });
    });

    // Clear Data
    document.getElementById("clear-data-btn").addEventListener("click", function () {
        if (confirm("Are you sure you want to delete all data? This action cannot be undone.")) {
            localStorage.clear();
            alert("All data has been deleted.");
        }
    });
});
