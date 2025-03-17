// Global state management
export const state = {
    events: JSON.parse(localStorage.getItem('events')) || [],
    todos: JSON.parse(localStorage.getItem('todos')) || [],
    subjects: JSON.parse(localStorage.getItem('subjects')) || [],
    currentSubject: null,
    currentFilter: 'all'
};

// Storage Functions
export function saveEvents() {
    localStorage.setItem('events', JSON.stringify(state.events));
}

export function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(state.todos));
}

export function saveSubjects() {
    localStorage.setItem('subjects', JSON.stringify(state.subjects));
} 