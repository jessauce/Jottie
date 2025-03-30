// About Us page functionality
export function initAboutUs() {
    console.log("About Us page initialized");
    
    // Animation for feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    if (featureCards.length > 0) {
        featureCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animated');
            }, 100 * index);
        });
    }
    
    // Animation for team members
    const teamMembers = document.querySelectorAll('.team-member');
    if (teamMembers.length > 0) {
        teamMembers.forEach((member, index) => {
            setTimeout(() => {
                member.classList.add('animated');
            }, 150 * index);
        });
    }
    
    // Handle contact button click
    const contactButton = document.querySelector('.contact-section .btn');
    if (contactButton) {
        contactButton.addEventListener('click', (e) => {
            // You can add tracking or additional functionality here
            console.log("Contact button clicked");
        });
    }
}