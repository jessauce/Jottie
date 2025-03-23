import { state, saveTodos } from './state.js';
import { formatDate, showModal, hideModal, setupModalCloseHandlers } from './utils.js';

export function initTodo() {
    const addTodoForm = document.getElementById('add-todo-form');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const editTodoForm = document.getElementById('edit-todo-form');
    const searchInput = document.getElementById('todo-search');
    
    addTodoForm.addEventListener('submit', handleAddTodo);
    editTodoForm.addEventListener('submit', handleUpdateTodo);
    
    filterButtons.forEach(button => {
        button.addEventListener('click', handleFilterClick);
    });

    searchInput.addEventListener('input', handleSearch);
    
    setupModalCloseHandlers('edit-todo-modal');
    renderTodos();
}

function handleSearch(e) {
    state.searchQuery = e.target.value.toLowerCase();
    renderTodos();
}

function handleFilterClick() {
    state.currentFilter = this.getAttribute('data-filter');
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    renderTodos();
}

function handleAddTodo(e) {
    e.preventDefault();
    
    const text = document.getElementById('todo-input').value;
    const priority = document.getElementById('todo-priority').value;
    
    const newTodo = {
        id: Date.now().toString(),
        text,
        priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    state.todos.push(newTodo);
    saveTodos();
    
    e.target.reset();
    renderTodos();
}

function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    
    // Filter todos based on current filter and search query
    let filteredTodos = [...state.todos];
    
    // Apply search filter
    if (state.searchQuery) {
        filteredTodos = filteredTodos.filter(todo => 
            todo.text.toLowerCase().includes(state.searchQuery)
        );
    }
    
    // Apply status filter
    if (state.currentFilter === 'active') {
        filteredTodos = filteredTodos.filter(todo => !todo.completed);
    } else if (state.currentFilter === 'completed') {
        filteredTodos = filteredTodos.filter(todo => todo.completed);
    }
    
    // Sort todos
    filteredTodos.sort((a, b) => {
        // First sort by completion status
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // Then sort by due date
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
    
    filteredTodos.forEach(todo => createTodoElement(todo, todoList));
}

function createTodoElement(todo, todoList) {
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
    
    showModal('edit-todo-modal');
}

function handleUpdateTodo(e) {
    e.preventDefault();
    
    const todoId = document.getElementById('edit-todo-id').value;
    const text = document.getElementById('edit-todo-text').value;
    const priority = document.getElementById('edit-todo-priority').value;
    
    const todo = state.todos.find(todo => todo.id === todoId);
    if (todo) {
        todo.text = text;
        todo.priority = priority;
        
        saveTodos();
        renderTodos();
        
        hideModal('edit-todo-modal');
    }
}

function deleteTodo(todoId) {
    if (confirm('Are you sure you want to delete this task?')) {
        state.todos = state.todos.filter(todo => todo.id !== todoId);
        saveTodos();
        renderTodos();
    }
} 