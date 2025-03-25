import { initCalendar } from './calendar.js';
import { initTodo } from './todo.js';
import { initBinder } from './binder.js';
import { initProfile } from './profile.js';
import { initDashboard } from './dashboard.js';

// Initialize the application
function init() {
    setupNavigation();
    initCalendar();
    initTodo();
    initBinder();
    initProfile();
    initDashboard();
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

