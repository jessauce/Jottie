import { initCalendar } from './calendar.js';
import { initTodo } from './todo.js';
import { initBinder } from './binder.js';

// Initialize the application
function init() {
    setupNavigation();
    initCalendar();
    initTodo();
    initBinder();
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.section');
    
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init); 