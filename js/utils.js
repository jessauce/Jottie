export function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
}

export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('show');
}

export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
}

export function setupModalCloseHandlers(modalId) {
    const modal = document.getElementById(modalId);
    const closeBtn = modal.querySelector('.close');
    
    closeBtn.onclick = () => hideModal(modalId);
    modal.onclick = (e) => {
        if (e.target === modal) hideModal(modalId);
    };
} 