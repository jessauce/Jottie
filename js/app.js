import { initCalendar } from './calendar.js';
import { initTodo } from './todo.js';
import { initBinder } from './binder.js';
import { initProfile } from './profile.js';
import { initDashboard } from './dashboard.js';
import { initAboutUs } from './aboutus.js';
import { handleSpotifyAuth } from './spotify.js';
//import { initJotify } from './jotify.js';
import { createSpotifyWidget } from './spotify.js';


// Initialize the application
function init() {
    setupNavigation();
    initCalendar();
    initTodo();
    initBinder();
    initProfile();
    initDashboard();
    initAboutUs();
    handleSpotifyAuth();
    //initJotify();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.section');
    
    // Setup main nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding section
            const sectionId = link.dataset.section;
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
        });
    });
    
    // Setup profile link in sidebar user area
    const profileLink = document.querySelector('.sidebar-user a');
    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all nav links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Show profile section
            const sectionId = profileLink.dataset.section;
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Function to handle header image functionality with save changes button
function setupHeaderImageFunctionality() {
    setupHeaderRepositioning();
    setupHeaderImageUpload();
    loadSavedImagesAndPositions();
    
    // Add save changes button functionality
    setupSaveChangesButton();
}

// Add save changes button functionality
function setupSaveChangesButton() {
    // Get all header image overlays
    const headerOverlays = document.querySelectorAll('.header-image-overlay');
    
    // Add save changes button to each overlay if not already present
    headerOverlays.forEach(overlay => {
        // Check if the save button already exists
        if (!overlay.querySelector('.header-save-btn')) {
            // Create new save changes button
            const saveButton = document.createElement('button');
            saveButton.className = 'header-save-btn';
            saveButton.innerHTML = '<i class="fas fa-save"></i> Save Changes';
            
            // Insert the button after the reposition button
            const repositionBtn = overlay.querySelector('.header-reposition-btn');
            if (repositionBtn) {
                repositionBtn.insertAdjacentElement('afterend', saveButton);
            } else {
                overlay.appendChild(saveButton);
            }
            
            // Add click event
            saveButton.addEventListener('click', saveHeaderChanges);
        }
    });
}

// Function to save header changes to localStorage
function saveHeaderChanges(e) {
    const saveButton = e.currentTarget;
    const headerContainer = saveButton.closest('.header-image-container');
    const headerImage = headerContainer.querySelector('.header-image');
    const sectionId = headerContainer.closest('section').id;
    
    // Get current image source
    const imageSource = headerImage.src;
    
    // Get current position
    const transform = headerImage.style.transform;
    let percentX = 0;
    let percentY = 0;
    
    // Extract percentages from transform or dataset
    if (headerImage.dataset.positionX !== undefined && headerImage.dataset.positionY !== undefined) {
        percentX = parseFloat(headerImage.dataset.positionX);
        percentY = parseFloat(headerImage.dataset.positionY);
    } else if (transform) {
        const match = transform.match(/translate\((.+?)%,\s*(.+?)%\)/);
        if (match) {
            percentX = parseFloat(match[1]);
            percentY = parseFloat(match[2]);
        }
    }
    
    // Save image to localStorage
    const headerImages = JSON.parse(localStorage.getItem('headerImages') || '{}');
    headerImages[sectionId] = imageSource;
    localStorage.setItem('headerImages', JSON.stringify(headerImages));
    
    // Save position to localStorage
    const headerPositions = JSON.parse(localStorage.getItem('headerPositions') || '{}');
    headerPositions[sectionId] = { percentX, percentY };
    localStorage.setItem('headerPositions', JSON.stringify(headerPositions));
    
    // Provide visual feedback
    const originalText = saveButton.innerHTML;
    saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
    
    // Reset button text after a delay
    setTimeout(() => {
        saveButton.innerHTML = originalText;
    }, 2000);
}

// Function to load saved images and positions
function loadSavedImagesAndPositions() {
    const headerImages = JSON.parse(localStorage.getItem('headerImages') || '{}');
    const headerPositions = JSON.parse(localStorage.getItem('headerPositions') || '{}');
    
    // Apply saved images and positions to each section
    document.querySelectorAll('.section').forEach(section => {
        const sectionId = section.id;
        const headerImage = section.querySelector('.header-image');
        
        if (headerImage) {
            // Apply saved image if exists
            if (headerImages[sectionId]) {
                headerImage.src = headerImages[sectionId];
            }
            
            // Apply saved position if exists
            if (headerPositions[sectionId]) {
                const pos = headerPositions[sectionId];
                
                if (pos.percentX !== undefined && pos.percentY !== undefined) {
                    // Set the data attributes
                    headerImage.dataset.positionX = pos.percentX;
                    headerImage.dataset.positionY = pos.percentY;
                    
                    // Apply the transformation
                    headerImage.style.transform = `translate(${pos.percentX}%, ${pos.percentY}%)`;
                }
            }
        }
    });
}

// Function to handle header image uploads (updated to reset positions properly)
function setupHeaderImageUpload() {
    const changeButtons = document.querySelectorAll('.header-change-btn');
    
    changeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Create a file input element
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            
            fileInput.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    const headerContainer = button.closest('.header-image-container');
                    const headerImage = headerContainer.querySelector('.header-image');
                    
                    reader.onload = function(e) {
                        headerImage.src = e.target.result;
                        
                        // Reset position when new image is uploaded
                        headerImage.style.transform = 'translate(0%, 0%)';
                        headerImage.dataset.positionX = 0;
                        headerImage.dataset.positionY = 0;
                        
                        // The actual save to localStorage happens when user clicks "Save Changes"
                    };
                    
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
            
            fileInput.click();
        });
    });
}

// Update the existing setupHeaderRepositioning function to work with the save changes button
function setupHeaderRepositioning() {
    // Variables to track repositioning state
    let isRepositioning = false;
    let startX, startY;
    let initialPercentX, initialPercentY;
    let activeHeaderImage = null;
    let activeHeaderContainer = null;
    
    // Get all reposition buttons
    const repositionButtons = document.querySelectorAll('.header-reposition-btn');
    
    // Add event listeners to all reposition buttons
    repositionButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the header image container and image
            const headerContainer = this.closest('.header-image-container');
            activeHeaderContainer = headerContainer;
            activeHeaderImage = headerContainer.querySelector('.header-image');
            
            if (!isRepositioning) {
                // Start repositioning
                startRepositioning(headerContainer);
            } else {
                // End repositioning
                endRepositioning();
            }
        });
    });
    
    // Function to start repositioning mode
    function startRepositioning(container) {
        isRepositioning = true;
        
        // Change cursor and add repositioning class
        container.classList.add('repositioning-mode');
        
        // Get current position from dataset or transform
        const headerImage = container.querySelector('.header-image');
        let currentPercentX = 0;
        let currentPercentY = 0;
        
        if (headerImage.dataset.positionX !== undefined && headerImage.dataset.positionY !== undefined) {
            currentPercentX = parseFloat(headerImage.dataset.positionX);
            currentPercentY = parseFloat(headerImage.dataset.positionY);
        } else {
            const transform = headerImage.style.transform;
            const match = transform.match(/translate\((.+?)%,\s*(.+?)%\)/);
            if (match) {
                currentPercentX = parseFloat(match[1]);
                currentPercentY = parseFloat(match[2]);
            }
        }
        
        initialPercentX = currentPercentX;
        initialPercentY = currentPercentY;
        
        // Find reposition button and change text
        const button = container.querySelector('.header-reposition-btn');
        button.innerHTML = '<i class="fas fa-check"></i> Done';
        
        // Add mouse events for dragging
        container.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // Add touch events for mobile
        container.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
    }
    
    // Function to end repositioning mode
    function endRepositioning() {
        isRepositioning = false;
        
        // Remove repositioning class from all containers
        document.querySelectorAll('.header-image-container').forEach(container => {
            container.classList.remove('repositioning-mode');
            
            // Reset button text
            const button = container.querySelector('.header-reposition-btn');
            button.innerHTML = '<i class="fas fa-arrows-alt"></i> Reposition';
        });
        
        // Remove event listeners
        if (activeHeaderContainer) {
            activeHeaderContainer.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            activeHeaderContainer.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        }
        
        activeHeaderImage = null;
        activeHeaderContainer = null;
    }
    
    // Helper function to update image position with percentages
    function updateImagePosition(image, percentX, percentY) {
        // Store the percentage values
        image.dataset.positionX = percentX;
        image.dataset.positionY = percentY;
        
        // Apply percentage-based transform using translate
        image.style.transform = `translate(${percentX}%, ${percentY}%)`;
    }
    
    // Mouse event handlers
    function handleMouseDown(e) {
        if (!isRepositioning) return;
        e.preventDefault();
        
        startX = e.clientX;
        startY = e.clientY;
    }
    
    function handleMouseMove(e) {
        if (!isRepositioning || !activeHeaderImage || !startX) return;
        
        // Calculate container dimensions for percentage calculation
        const containerWidth = activeHeaderContainer.offsetWidth;
        const containerHeight = activeHeaderContainer.offsetHeight;
        
        // Calculate delta movement in pixels
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        // Convert pixel movement to percentage of container size
        const deltaPercentX = (deltaX / containerWidth) * 100;
        const deltaPercentY = (deltaY / containerHeight) * 100;
        
        // Calculate new percentage position
        initialPercentX = initialPercentX + deltaPercentX;
        initialPercentY = initialPercentY + deltaPercentY;
        
        // Apply new position using percentages
        updateImagePosition(activeHeaderImage, initialPercentX, initialPercentY);
        
        // Reset start coordinates
        startX = e.clientX;
        startY = e.clientY;
    }
    
    function handleMouseUp() {
        if (!isRepositioning) return;
        startX = null;
        startY = null;
    }
    
    // Touch event handlers
    function handleTouchStart(e) {
        if (!isRepositioning) return;
        e.preventDefault();
        
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }
    
    function handleTouchMove(e) {
        if (!isRepositioning || !activeHeaderImage || !startX) return;
        e.preventDefault();
        
        // Calculate container dimensions for percentage calculation
        const containerWidth = activeHeaderContainer.offsetWidth;
        const containerHeight = activeHeaderContainer.offsetHeight;
        
        // Calculate delta movement in pixels
        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;
        
        // Convert pixel movement to percentage of container size
        const deltaPercentX = (deltaX / containerWidth) * 100;
        const deltaPercentY = (deltaY / containerHeight) * 100;
        
        // Calculate new percentage position
        initialPercentX = initialPercentX + deltaPercentX;
        initialPercentY = initialPercentY + deltaPercentY;
        
        // Apply new position using percentages
        updateImagePosition(activeHeaderImage, initialPercentX, initialPercentY);
        
        // Reset start coordinates
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }
    
    function handleTouchEnd() {
        if (!isRepositioning) return;
        startX = null;
        startY = null;
    }
}

// Initialize header image functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', setupHeaderImageFunctionality);

document.addEventListener('DOMContentLoaded', () => {
    const jotifySection = document.getElementById('jotify');

    if (jotifySection) {
        createSpotifyWidget(document.getElementById('spotify-container'));
    }
});
