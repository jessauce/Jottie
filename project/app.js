// Global state
const state = {
    events: JSON.parse(localStorage.getItem('events')) || [],
    todos: JSON.parse(localStorage.getItem('todos')) || [],
    subjects: JSON.parse(localStorage.getItem('subjects')) || [],
    currentSubject: null,
    currentFilter: 'all'
};

// DOM Elements
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('.section');
const calendarDays = document.getElementById('calendar-days');
const currentMonthElement = document.getElementById('current-month');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const addEventForm = document.getElementById('add-event-form');
const eventsContainer = document.getElementById('events-container');
const addTodoForm = document.getElementById('add-todo-form');
const todoList = document.getElementById('todo-list');
const filterButtons = document.querySelectorAll('.filter-btn');
const addSubjectForm = document.getElementById('add-subject-form');
const subjectsList = document.getElementById('subjects-list');
const noSubjectSelected = document.getElementById('no-subject-selected');
const subjectDetails = document.getElementById('subject-details');
const currentSubjectName = document.getElementById('current-subject-name');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const saveNotesButton = document.getElementById('save-notes');
const notesContent = document.getElementById('notes-content');
const documentUploadForm = document.getElementById('document-upload-form');
const documentsContainer = document.getElementById('documents-container');
const addGradeForm = document.getElementById('add-grade-form');
const gradesContainer = document.getElementById('grades-container');
const averageScore = document.getElementById('average-score');
const editTodoModal = document.getElementById('edit-todo-modal');
const editTodoForm = document.getElementById('edit-todo-form');
const editTodoCloseButton = editTodoModal.querySelector('.close');
const eventDetailsModal = document.getElementById('event-details-modal');
const eventDetailsCloseButton = eventDetailsModal.querySelector('.close');
const deleteEventButton = document.getElementById('delete-event');

// Current date and calendar state
let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Initialize the application
function init() {
    setupEventListeners();
    renderCalendar();
    renderEvents();
    renderTodos();
    renderSubjects();
}

// Set up event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            
            // Update active link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Show target section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
        });
    });
    
    // Calendar navigation
    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Add event form
    addEventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addEvent();
    });
    
    // Add todo form
    addTodoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addTodo();
    });
    
    // Todo filters
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            state.currentFilter = this.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderTodos();
        });
    });
    
    // Add subject form
    addSubjectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addSubject();
    });
    
    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Show target tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
    
    // Save notes
    saveNotesButton.addEventListener('click', saveNotes);
    
    // Document upload form
    documentUploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        uploadDocument();
    });
    
    // Add grade form
    addGradeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addGrade();
    });
    
    // Edit todo modal
    editTodoCloseButton.addEventListener('click', () => {
        editTodoModal.style.display = 'none';
    });
    
    editTodoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        updateTodo();
    });
    
    // Event details modal
    eventDetailsCloseButton.addEventListener('click', () => {
        eventDetailsModal.style.display = 'none';
    });
    
    deleteEventButton.addEventListener('click', deleteEvent);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === editTodoModal) {
            editTodoModal.style.display = 'none';
        }
        if (e.target === eventDetailsModal) {
            eventDetailsModal.style.display = 'none';
        }
    });
}

// Calendar Functions
function renderCalendar() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const daysInPrevMonth = prevMonthLastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Update month and year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    // Clear previous calendar
    calendarDays.innerHTML = '';
    
    // Add days from previous month
    for (let i = startingDay - 1; i >= 0; i--) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day', 'other-month');
        
        const dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = daysInPrevMonth - i;
        
        dayElement.appendChild(dayNumber);
        calendarDays.appendChild(dayElement);
    }
    
    // Add days for current month
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        
        // Check if this day is today
        if (currentYear === today.getFullYear() && currentMonth === today.getMonth() && i === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        const dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = i;
        
        dayElement.appendChild(dayNumber);
        
        // Add event indicators and list
        const dateString = formatDate(new Date(currentYear, currentMonth, i));
        const dayEvents = state.events.filter(event => event.date === dateString);
        
        if (dayEvents.length > 0) {
            const eventList = document.createElement('div');
            eventList.classList.add('event-list');
            
            dayEvents.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.classList.add('event-item');
                eventItem.textContent = event.title;
                eventItem.addEventListener('click', () => showEventDetails(event));
                eventList.appendChild(eventItem);
            });
            
            dayElement.appendChild(eventList);
        }
        
        // Make day clickable to add event
        dayElement.addEventListener('click', () => {
            document.getElementById('event-date').value = formatDate(new Date(currentYear, currentMonth, i));
            document.getElementById('event-title').focus();
        });
        
        calendarDays.appendChild(dayElement);
    }
    
    // Add days from next month to fill the grid
    const totalDaysAdded = startingDay + daysInMonth;
    const remainingDays = 42 - totalDaysAdded; // 6 rows of 7 days
    
    for (let i = 1; i <= remainingDays; i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day', 'other-month');
        
        const dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = i;
        
        dayElement.appendChild(dayNumber);
        calendarDays.appendChild(dayElement);
    }
}

function addEvent() {
    const title = document.getElementById('event-title').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;
    const description = document.getElementById('event-description').value;
    
    const newEvent = {
        id: Date.now().toString(),
        title,
        date,
        time,
        description
    };
    
    state.events.push(newEvent);
    saveEvents();
    
    // Reset form
    addEventForm.reset();
    
    // Update calendar and events list
    renderCalendar();
    renderEvents();
}

function renderEvents() {
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
            <strong>${event.title}</strong>
            <div>${formattedDate} ${event.time ? '• ' + formatTime(event.time) : ''}</div>
        `;
        
        eventItem.addEventListener('click', () => showEventDetails(event));
        
        eventsContainer.appendChild(eventItem);
    });
}

function showEventDetails(event) {
    document.getElementById('modal-event-title').textContent = event.title;
    
    const eventDate = new Date(event.date);
    document.getElementById('modal-event-date').textContent = eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('modal-event-time').textContent = event.time ? formatTime(event.time) : 'All day';
    document.getElementById('modal-event-description').textContent = event.description || 'No description provided';
    
    // Set up delete button
    deleteEventButton.onclick = () => {
        deleteEvent(event.id);
        eventDetailsModal.style.display = 'none';
    };
    
    eventDetailsModal.style.display = 'block';
}

function deleteEvent(eventId) {
    state.events = state.events.filter(event => event.id !== eventId);
    saveEvents();
    renderCalendar();
    renderEvents();
    eventDetailsModal.style.display = 'none';
}

// Todo Functions
function addTodo() {
    const text = document.getElementById('todo-input').value;
    const priority = document.getElementById('todo-priority').value;
    const dueDate = document.getElementById('todo-due-date').value;
    
    const newTodo = {
        id: Date.now().toString(),
        text,
        priority,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    state.todos.push(newTodo);
    saveTodos();
    
    // Reset form
    addTodoForm.reset();
    
    // Update todo list
    renderTodos();
}

function renderTodos() {
    todoList.innerHTML = '';
    
    // Filter todos based on current filter
    let filteredTodos = [...state.todos];
    
    if (state.currentFilter === 'active') {
        filteredTodos = filteredTodos.filter(todo => !todo.completed);
    } else if (state.currentFilter === 'completed') {
        filteredTodos = filteredTodos.filter(todo => todo.completed);
    }
    
    // Sort todos: first by completion status, then by due date, then by priority
    filteredTodos.sort((a, b) => {
        // First sort by completion status
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // Then sort by due date (if available)
        if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (a.dueDate) {
            return -1;
        } else if (b.dueDate) {
            return 1;
        }
        
        // Then sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    if (filteredTodos.length === 0) {
        const noTodos = document.createElement('li');
        noTodos.textContent = 'No tasks found';
        todoList.appendChild(noTodos);
        return;
    }
    
    filteredTodos.forEach(todo => {
        const todoItem = document.createElement('li');
        todoItem.classList.add('todo-item');
        if (todo.completed) {
            todoItem.classList.add('completed');
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('todo-checkbox');
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodoCompletion(todo.id));
        
        const content = document.createElement('div');
        content.classList.add('todo-content');
        
        const text = document.createElement('div');
        text.classList.add('todo-text');
        text.textContent = todo.text;
        
        const meta = document.createElement('div');
        meta.classList.add('todo-meta');
        
        const priority = document.createElement('span');
        priority.classList.add('todo-priority', `priority-${todo.priority}`);
        priority.textContent = todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1);
        
        meta.appendChild(priority);
        
        if (todo.dueDate) {
            const dueDate = document.createElement('span');
            dueDate.textContent = `Due: ${formatDate(new Date(todo.dueDate))}`;
            meta.appendChild(dueDate);
        }
        
        content.appendChild(text);
        content.appendChild(meta);
        
        const actions = document.createElement('div');
        actions.classList.add('todo-actions');
        
        const editButton = document.createElement('button');
        editButton.classList.add('edit-btn');
        editButton.innerHTML = '<i class="fas fa-edit"></i>';
        editButton.addEventListener('click', () => showEditTodoModal(todo));
        
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.addEventListener('click', () => deleteTodo(todo.id));
        
        actions.appendChild(editButton);
        actions.appendChild(deleteButton);
        
        todoItem.appendChild(checkbox);
        todoItem.appendChild(content);
        todoItem.appendChild(actions);
        
        todoList.appendChild(todoItem);
    });
}

function toggleTodoCompletion(todoId) {
    const todo = state.todos.find(todo => todo.id === todoId);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function showEditTodoModal(todo) {
    document.getElementById('edit-todo-id').value = todo.id;
    document.getElementById('edit-todo-text').value = todo.text;
    document.getElementById('edit-todo-priority').value = todo.priority;
    document.getElementById('edit-todo-due-date').value = todo.dueDate || '';
    
    editTodoModal.style.display = 'block';
}

function updateTodo() {
    const todoId = document.getElementById('edit-todo-id').value;
    const text = document.getElementById('edit-todo-text').value;
    const priority = document.getElementById('edit-todo-priority').value;
    const dueDate = document.getElementById('edit-todo-due-date').value;
    
    const todo = state.todos.find(todo => todo.id === todoId);
    if (todo) {
        todo.text = text;
        todo.priority = priority;
        todo.dueDate = dueDate;
        
        saveTodos();
        renderTodos();
        
        editTodoModal.style.display = 'none';
    }
}

function deleteTodo(todoId) {
    if (confirm('Are you sure you want to delete this task?')) {
        state.todos = state.todos.filter(todo => todo.id !== todoId);
        saveTodos();
        renderTodos();
    }
}

// Subject Functions
function addSubject() {
    const name = document.getElementById('subject-input').value;
    
    const newSubject = {
        id: Date.now().toString(),
        name,
        notes: '',
        documents: [],
        grades: []
    };
    
    state.subjects.push(newSubject);
    saveSubjects();
    
    // Reset form
    document.getElementById('subject-input').value = '';
    
    // Update subjects list
    renderSubjects();
}

function renderSubjects() {
    subjectsList.innerHTML = '';
    
    if (state.subjects.length === 0) {
        const noSubjects = document.createElement('li');
        noSubjects.textContent = 'No subjects added yet';
        subjectsList.appendChild(noSubjects);
        return;
    }
    
    state.subjects.forEach(subject => {
        const subjectItem = document.createElement('li');
        subjectItem.classList.add('subject-item');
        if (state.currentSubject && state.currentSubject.id === subject.id) {
            subjectItem.classList.add('active');
        }
        
        subjectItem.innerHTML = `
            <span>${subject.name}</span>
            <button class="delete-subject"><i class="fas fa-times"></i></button>
        `;
        
        subjectItem.querySelector('span').addEventListener('click', () => selectSubject(subject));
        subjectItem.querySelector('.delete-subject').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSubject(subject.id);
        });
        
        subjectsList.appendChild(subjectItem);
    });
}

function selectSubject(subject) {
    state.currentSubject = subject;
    
    // Update UI
    document.querySelectorAll('.subject-item').forEach(item => item.classList.remove('active'));
    document.querySelector(`.subject-item:nth-child(${state.subjects.indexOf(subject) + 1})`).classList.add('active');
    
    noSubjectSelected.style.display = 'none';
    subjectDetails.style.display = 'block';
    
    currentSubjectName.textContent = subject.name;
    
    // Load subject data
    notesContent.value = subject.notes || '';
    
    renderDocuments();
    renderGrades();
}

function deleteSubject(subjectId) {
    if (confirm('Are you sure you want to delete this subject? All notes, documents, and grades will be lost.')) {
        state.subjects = state.subjects.filter(subject => subject.id !== subjectId);
        
        if (state.currentSubject && state.currentSubject.id === subjectId) {
            state.currentSubject = null;
            noSubjectSelected.style.display = 'flex';
            subjectDetails.style.display = 'none';
        }
        
        saveSubjects();
        renderSubjects();
    }
}

function saveNotes() {
    if (!state.currentSubject) return;
    
    state.currentSubject.notes = notesContent.value;
    saveSubjects();
    
    alert('Notes saved successfully!');
}

function uploadDocument() {
    if (!state.currentSubject) return;
    
    const name = document.getElementById('document-name').value;
    const file = document.getElementById('document-file').files[0];
    const url = document.getElementById('document-url').value;
    
    if (!name || (!file && !url)) {
        alert('Please provide a document name and either upload a file or enter a URL.');
        return;
    }
    
    let documentUrl = url;
    
    // If a file is uploaded, we would normally upload it to a server
    // Since we're simulating this, we'll just store the file name
    if (file) {
        // In a real application, this would be the URL returned from the server after upload
        documentUrl = `file://${file.name}`;
    }
    
    const newDocument = {
        id: Date.now().toString(),
        name,
        url: documentUrl,
        uploadedAt: new Date().toISOString()
    };
    
    state.currentSubject.documents.push(newDocument);
    saveSubjects();
    
    // Reset form
    documentUploadForm.reset();
    
    // Update documents list
    renderDocuments();
}

function renderDocuments() {
    if (!state.currentSubject) return;
    
    documentsContainer.innerHTML = '';
    
    if (state.currentSubject.documents.length === 0) {
        const noDocuments = document.createElement('li');
        noDocuments.textContent = 'No documents uploaded yet';
        documentsContainer.appendChild(noDocuments);
        return;
    }
    
    state.currentSubject.documents.forEach(document => {
        const documentItem = document.createElement('li');
        documentItem.classList.add('document-item');
        
        documentItem.innerHTML = `
            <div class="document-name">${document.name}</div>
            <div class="document-actions">
                <button class="view-btn"><i class="fas fa-external-link-alt"></i></button>
                <button class="delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        documentItem.querySelector('.view-btn').addEventListener('click', () => {
            // In a real application, this would open the document
            alert(`Opening document: ${document.url}`);
        });
        
        documentItem.querySelector('.delete-btn').addEventListener('click', () => deleteDocument(document.id));
        
        documentsContainer.appendChild(documentItem);
    });
}

function deleteDocument(documentId) {
    if (!state.currentSubject) return;
    
    if (confirm('Are you sure you want to delete this document?')) {
        state.currentSubject.documents = state.currentSubject.documents.filter(doc => doc.id !== documentId);
        saveSubjects();
        renderDocuments();
    }
}

function addGrade() {
    if (!state.currentSubject) return;
    
    const name = document.getElementById('exam-name').value;
    const score = parseFloat(document.getElementById('exam-score').value);
    const date = document.getElementById('exam-date').value;
    
    const newGrade = {
        id: Date.now().toString(),
        name,
        score,
        date,
        addedAt: new Date().toISOString()
    };
    
    state.currentSubject.grades.push(newGrade);
    saveSubjects();
    
    // Reset form
    addGradeForm.reset();
    
    // Update grades list
    renderGrades();
}

function renderGrades() {
    if (!state.currentSubject) return;
    
    gradesContainer.innerHTML = '';
    
    if (state.currentSubject.grades.length === 0) {
        const noGrades = document.createElement('tr');
        noGrades.innerHTML = '<td colspan="4">No grades added yet</td>';
        gradesContainer.appendChild(noGrades);
        
        averageScore.textContent = 'N/A';
        return;
    }
    
    // Sort grades by date (newest first)
    const sortedGrades = [...state.currentSubject.grades].sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
    });
    
    sortedGrades.forEach(grade => {
        const gradeRow = document.createElement('tr');
        
        gradeRow.innerHTML = `
            <td>${grade.name}</td>
            <td>${grade.score}%</td>
            <td>${grade.date ? formatDate(new Date(grade.date)) : 'N/A'}</td>
            <td>
                <div class="grade-actions">
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        
        gradeRow.querySelector('.delete-btn').addEventListener('click', () => deleteGrade(grade.id));
        
        gradesContainer.appendChild(gradeRow);
    });
    
    // Calculate and display average score
    const totalScore = state.currentSubject.grades.reduce((sum, grade) => sum + grade.score, 0);
    const average = totalScore / state.currentSubject.grades.length;
    averageScore.textContent = `${average.toFixed(2)}%`;
}

function deleteGrade(gradeId) {
    if (!state.currentSubject) return;
    
    if (confirm('Are you sure you want to delete this grade?')) {
        state.currentSubject.grades = state.currentSubject.grades.filter(grade => grade.id !== gradeId);
        saveSubjects();
        renderGrades();
    }
}

// Helper Functions
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
}

// Storage Functions
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(state.events));
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(state.todos));
}

function saveSubjects() {
    localStorage.setItem('subjects', JSON.stringify(state.subjects));
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);

// Add these functions to your existing JavaScript
function showAddEventModal(date) {
    const modal = document.getElementById('add-event-modal');
    const dateInput = document.getElementById('event-date');
    
    // Set the date input to the clicked date
    dateInput.value = date;
    
    // Show the modal
    modal.classList.add('show');
}

// Add click event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add click handlers for calendar days
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.addEventListener('click', function(e) {
        const dayCell = e.target.closest('.day');
        if (dayCell && !dayCell.classList.contains('other-month')) {
            const date = dayCell.dataset.date; // Make sure you set this data attribute when creating calendar days
            showAddEventModal(date);
        }
    });

    // Close modal when clicking the close button or outside the modal
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = function() {
            modal.classList.remove('show');
        }

        // Close when clicking outside the modal content
        modal.onclick = function(e) {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        }
    });

    // Handle navigation clicks
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding section
            const sectionId = link.dataset.section;
            const sections = document.querySelectorAll('.section');
            
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === sectionId) {
                    section.classList.add('active');
                }
            });
        });
    });
});