import { state, saveEvents } from './state.js';
import { formatDate, formatTime, showModal, hideModal, setupModalCloseHandlers } from './utils.js';

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

export function initCalendar() {
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const addEventForm = document.getElementById('add-event-form');
    const deleteEventButton = document.getElementById('delete-event');
    const editEventForm = document.getElementById('edit-event-form');
    
    prevMonthButton.addEventListener('click', navigatePrevMonth);
    nextMonthButton.addEventListener('click', navigateNextMonth);
    addEventForm.addEventListener('submit', handleAddEvent);
    deleteEventButton.addEventListener('click', () => deleteEvent(state.currentEventId));
    
    // Set up edit form submission
    editEventForm.addEventListener('submit', handleEditEvent);
    
    // Set up edit form save button
    const editFormSaveBtn = document.querySelector('#edit-event-modal button[type="submit"]');
    editFormSaveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleEditEvent(new Event('submit'));
    });
    
    setupModalCloseHandlers('add-event-modal');
    setupModalCloseHandlers('event-details-modal');
    setupModalCloseHandlers('edit-event-modal');
    setupModalCloseHandlers('day-events-modal');
    
    // Add color picker functionality
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', handleColorSelection);
    });
    
    // Setup cancel buttons in modals
    setupCancelButtons();

    
    
    renderCalendar();
    renderEvents();
}

function navigatePrevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
}

function navigateNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
}

function renderCalendar() {
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthElement = document.getElementById('current-month');
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevMonthLastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    calendarDays.innerHTML = '';
    
    // Previous month days
    for (let i = startingDay - 1; i >= 0; i--) {
        createDayElement(daysInPrevMonth - i, true);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
        createDayElement(i, false);
    }
    
    // Next month days
    const totalDaysAdded = startingDay + daysInMonth;
    const remainingDays = 42 - totalDaysAdded;
    
    for (let i = 1; i <= remainingDays; i++) {
        createDayElement(i, true);
    }
}

function createDayElement(dayNumber, isOtherMonth) {
    const calendarDays = document.getElementById('calendar-days');
    const dayElement = document.createElement('div');
    dayElement.classList.add('day');
    if (isOtherMonth) dayElement.classList.add('other-month');
    
    const date = new Date(currentYear, isOtherMonth ? (currentMonth + (dayNumber > 15 ? -1 : 1)) : currentMonth, dayNumber);
    dayElement.dataset.date = formatDate(date);
    
    // Check if this day is today
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
    }
    
    const dayNumberElement = document.createElement('div');
    dayNumberElement.classList.add('day-number');
    dayNumberElement.textContent = dayNumber;
    dayElement.appendChild(dayNumberElement);
    
    // Add events for this day
    const dateString = formatDate(date);
    const dayEvents = state.events.filter(event => event.date === dateString);
    
    if (dayEvents.length > 0) {
        const eventIndicatorWrapper = document.createElement('div');
        eventIndicatorWrapper.classList.add('event-indicator-wrapper');
        
        dayEvents.forEach(event => {
            const eventIndicator = createEventIndicator(event);
            eventIndicatorWrapper.appendChild(eventIndicator);
        });
        
        dayElement.appendChild(eventIndicatorWrapper);
    }
    
    // Add click handler for showing day events modal
    if (!isOtherMonth) {
        dayElement.addEventListener('click', () => showDayEventsModal(dateString));
    }
    
    calendarDays.appendChild(dayElement);
}

function createEventIndicator(event) {
    const eventIndicator = document.createElement('div');
    eventIndicator.classList.add('event-indicator');
    eventIndicator.textContent = event.title;
    
    // Apply custom color styles
    eventIndicator.style.backgroundColor = `${event.color}15`; // 15 is hex for 10% opacity
    eventIndicator.style.color = event.color;
    eventIndicator.style.borderLeftColor = event.color;
    
    eventIndicator.addEventListener('click', (e) => {
        e.stopPropagation();
        showEventDetails(event);
    });
    
    return eventIndicator;
}

function setupCancelButtons() {
    // Setup cancel buttons in add event modal
    const addEventCancelBtns = document.querySelectorAll('#add-event-modal .btn-secondary, #add-event-modal .close');
    addEventCancelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal('add-event-modal');
            // If we came from day events modal, go back to it
            if (state.previousModal === 'day-events-modal') {
                showModal('day-events-modal');
            }
        });
    });

    // Setup cancel buttons in edit event modal
    const editEventCancelBtns = document.querySelectorAll('#edit-event-modal .btn-secondary, #edit-event-modal .close');
    editEventCancelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal('edit-event-modal');
            // If we came from day events modal, go back to it
            if (state.previousModal === 'day-events-modal') {
                showModal('day-events-modal');
            }
        });
    });

    // Setup close button in day events modal
    const dayEventsCloseBtns = document.querySelectorAll('#day-events-modal .close');
    dayEventsCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal('day-events-modal');
        });
    });
}

function showAddEventModal(date) {
    state.previousModal = document.querySelector('.modal.show')?.id;
    const dateInput = document.getElementById('event-date');
    dateInput.value = date;
    showModal('add-event-modal');
}

function handleAddEvent(e) {
    e.preventDefault();
    
    const title = document.getElementById('event-title').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const description = document.getElementById('event-description').value;
    const color = document.getElementById('event-color').value || '#C8B6A6'; // Default to light beige
    
    const newEvent = {
        id: Date.now().toString(),
        title,
        date,
        time,
        description,
        color
    };
    
    state.events.push(newEvent);
    saveEvents();

    // Show success message
    showSuccessMessage('Event added successfully!');
    
    // Reset form and close modal
    e.target.reset();
    document.querySelector('.color-option[data-color="#0A84FF"]').classList.add('active');
    document.getElementById('event-color').value = '#0A84FF';
    hideModal('add-event-modal');
    
    // If we came from day events modal, refresh and show it again
    if (state.previousModal === 'day-events-modal') {
        showDayEventsModal(date);
    }
    
    // Update calendar and events list
    renderCalendar();
    renderEvents();
}

function showEventDetails(event) {
    state.currentEventId = event.id;
    
    // Set the color accent
    const modalContent = document.querySelector('#event-details-modal .modal-content');
    modalContent.style.setProperty('--event-color', event.color);
    modalContent.style.setProperty('border-top', `4px solid ${event.color}`);
    
    // Set event details
    document.getElementById('modal-event-title').textContent = event.title;
    
    const eventDate = new Date(event.date);
    document.getElementById('modal-event-date').textContent = eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('modal-event-time').textContent = event.time ? 
        formatTime(event.time) : 'All day';
    
    const description = document.getElementById('modal-event-description');
    description.textContent = event.description || 'No description provided';
    if (!event.description) {
        description.classList.add('text-muted');
    } else {
        description.classList.remove('text-muted');
    }
    
    // Set up edit button
    const editButton = document.getElementById('edit-event');
    editButton.onclick = () => {
        hideModal('event-details-modal');
        showEditEventModal(event);
    };
    
    // Set up delete button
    const deleteButton = document.getElementById('delete-event');
    deleteButton.onclick = () => {
        if (confirm('Are you sure you want to delete this event?')) {
            deleteEvent(event.id);
        }
    };
    
    showModal('event-details-modal');
}

function showEditEventModal(event) {
    state.previousModal = document.querySelector('.modal.show')?.id;
    
    // Populate form fields
    document.getElementById('edit-event-id').value = event.id;
    document.getElementById('edit-event-title').value = event.title;
    document.getElementById('edit-event-date').value = event.date;
    document.getElementById('edit-event-time').value = event.time || '';
    document.getElementById('edit-event-description').value = event.description || '';
    document.getElementById('edit-event-color').value = event.color;
    
    // Set active color
    document.querySelectorAll('#edit-event-modal .color-option').forEach(option => {
        option.classList.toggle('active', option.dataset.color === event.color);
    });
    
    // Set up color picker
    const colorOptions = document.querySelectorAll('#edit-event-modal .color-option');
    colorOptions.forEach(option => {
        option.onclick = (e) => {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById('edit-event-color').value = e.target.dataset.color;
        };
    });
    
    showModal('edit-event-modal');
}

function handleEditEvent(e) {
    if (e) {
        e.preventDefault(); // Prevent form submission
    }
    
    const eventId = document.getElementById('edit-event-id').value;
    const event = state.events.find(e => e.id === eventId);
    
    if (event) {
        // Update the event with new values
        event.title = document.getElementById('edit-event-title').value;
        event.date = document.getElementById('edit-event-date').value;
        event.time = document.getElementById('edit-event-time').value;
        event.description = document.getElementById('edit-event-description').value;
        event.color = document.getElementById('edit-event-color').value;
        
        // Save changes to storage
        saveEvents();
        

        
        // Update UI
        renderCalendar();
        renderEvents();
        
        // Close the edit modal
        hideModal('edit-event-modal');
        
        // If we came from day events modal, refresh and show it again
        if (state.previousModal === 'day-events-modal') {
            showDayEventsModal(event.date);
        }
    }
}

// Add this function to show success message
function showSuccessMessage(message) {
    // Create success message element if it doesn't exist
    let successMessage = document.getElementById('success-message');
    if (!successMessage) {
        successMessage = document.createElement('div');
        successMessage.id = 'success-message';
        document.body.appendChild(successMessage);
    }
    
    // Set message and show
    successMessage.textContent = message;
    successMessage.classList.add('show');
    
    // Hide after 2 seconds
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 2000);
}

function deleteEvent(eventId) {
    state.events = state.events.filter(event => event.id !== eventId);
    saveEvents();

    hideModal('event-details-modal');
    renderCalendar();
    renderEvents();

    // Show success message
    showSuccessMessage('Event deleted successfully!');
}

function renderEvents() {
    const eventsContainer = document.getElementById('events-container');
    eventsContainer.innerHTML = '';
    
    // Sort events by date
    const sortedEvents = [...state.events].sort((a, b) => {
        const dateA = new Date(a.date + (a.time ? 'T' + a.time : ''));
        const dateB = new Date(b.date + (b.time ? 'T' + b.time : ''));
        return dateA - dateB;
    });
    
    // Filter for upcoming events
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcomingEvents = sortedEvents.filter(event => {
        const eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
    });
    
    if (upcomingEvents.length === 0) {
        const noEvents = document.createElement('li');
        noEvents.textContent = 'No upcoming events';
        eventsContainer.appendChild(noEvents);
        return;
    }
    
    upcomingEvents.forEach(event => {
        const eventItem = document.createElement('li');
        
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        eventItem.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div>${formattedDate} ${event.time ? '• ' + formatTime(event.time) : ''}</div>
        `;
        
        eventItem.addEventListener('click', () => showEventDetails(event));
        eventsContainer.appendChild(eventItem);
    });
}

function handleColorSelection(e) {
    const selectedColor = e.target.dataset.color;
    document.getElementById('event-color').value = selectedColor;
    
    // Update active state
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    e.target.classList.add('active');
}

function showDayEventsModal(date) {
    const modal = document.getElementById('day-events-modal');
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
    
    // Set modal title
    document.getElementById('day-events-date').textContent = `Events for ${formattedDate}`;
    
    // Get events for this date
    const dayEvents = state.events.filter(event => event.date === date);
    
    // Populate events list
    const eventsList = document.getElementById('day-events-list');
    eventsList.innerHTML = '';
    
    if (dayEvents.length === 0) {
        eventsList.innerHTML = '<div class="no-events">No events scheduled for this day</div>';
    } else {
        dayEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.classList.add('event-item');
            eventItem.innerHTML = `
                <div class="event-title">${event.title}</div>
                <div class="event-time">${event.time ? formatTime(event.time) : 'All day'}</div>
                ${event.description ? `<div class="event-description">${event.description}</div>` : ''}
                <div class="event-actions">
                    <button class="btn secondary edit-event" data-event-id="${event.id}">Edit</button>
                    <button class="btn danger delete-event" data-event-id="${event.id}">Delete</button>
                </div>
            `;
            
            // Add event listeners for edit and delete buttons
            const editBtn = eventItem.querySelector('.edit-event');
            const deleteBtn = eventItem.querySelector('.delete-event');
            
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                hideModal('day-events-modal');
                showEditEventModal(event);
            });
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this event?')) {
                    deleteEvent(event.id);
                    showDayEventsModal(date); // Refresh the modal
                }
            });
            
            eventsList.appendChild(eventItem);
        });
    }
    
    // Add event listener for "Add New Event" button
    const addNewEventBtn = document.getElementById('add-new-event-btn');
    addNewEventBtn.onclick = () => {
        hideModal('day-events-modal');
        showAddEventModal(date);
    };
    
    showModal('day-events-modal');
}