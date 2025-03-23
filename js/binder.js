import { state, saveSubjects } from './state.js';
import { formatDate } from './utils.js';

export function initBinder() {
    const addSubjectForm = document.getElementById('add-subject-form');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const saveNotesButton = document.getElementById('save-notes');
    const documentUploadForm = document.getElementById('document-upload-form');
    const addGradeForm = document.getElementById('add-grade-form');
    
    // Initialize state if needed
    if (!state.subjects) {
        state.subjects = [];
    }
    
    addSubjectForm.addEventListener('submit', handleAddSubject);
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });
    saveNotesButton.addEventListener('click', saveNotes);
    documentUploadForm.addEventListener('submit', handleDocumentUpload);
    addGradeForm.addEventListener('submit', handleAddGrade);
    
    // Show initial state
    renderSubjects();
    if (state.currentSubject) {
        selectSubject(state.currentSubject);
    }
}

function handleTabClick(e) {
    const targetTab = e.target.getAttribute('data-tab');
    
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    // Show target tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${targetTab}-tab`).classList.add('active');
}

function handleAddSubject(e) {
    e.preventDefault();
    
    const name = document.getElementById('subject-input').value.trim();
    
    if (!name) {
        alert('Please enter a subject name');
        return;
    }
    
    // Check for duplicate names
    if (state.subjects.some(subject => subject.name.toLowerCase() === name.toLowerCase())) {
        alert('A subject with this name already exists');
        return;
    }
    
    const newSubject = {
        id: Date.now().toString(),
        name,
        notes: '',
        documents: [],
        grades: []
    };
    
    state.subjects.push(newSubject);
    saveSubjects();
    
    e.target.reset();
    renderSubjects();
    
    // Automatically select the new subject
    selectSubject(newSubject);
}

function renderSubjects() {
    const subjectsList = document.getElementById('subjects-list');
    subjectsList.innerHTML = '';
    
    if (state.subjects.length === 0) {
        const noSubjects = document.createElement('li');
        noSubjects.textContent = 'No subjects added yet';
        noSubjects.style.color = 'var(--text-light)';
        noSubjects.style.textAlign = 'center';
        noSubjects.style.padding = '1rem';
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
            <button class="delete-subject" title="Delete subject"><i class="fas fa-times"></i></button>
        `;
        
        subjectItem.addEventListener('click', () => selectSubject(subject));
        
        const deleteButton = subjectItem.querySelector('.delete-subject');
        deleteButton.addEventListener('click', (e) => {
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
    const selectedItem = Array.from(document.querySelectorAll('.subject-item')).find(
        item => item.querySelector('span').textContent === subject.name
    );
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    document.getElementById('no-subject-selected').style.display = 'none';
    document.getElementById('subject-details').style.display = 'block';
    
    document.getElementById('current-subject-name').textContent = subject.name;
    
    // Load subject data
    document.getElementById('notes-content').value = subject.notes || '';
    
    // Reset active tab to Notes
    const notesTab = document.querySelector('[data-tab="notes"]');
    if (notesTab) {
        notesTab.click();
    }
    
    renderDocuments();
    renderGrades();
}

function deleteSubject(subjectId) {
    if (!confirm('Are you sure you want to delete this subject? All notes, documents, and grades will be lost.')) {
        return;
    }
    
    state.subjects = state.subjects.filter(subject => subject.id !== subjectId);
    
    if (state.currentSubject && state.currentSubject.id === subjectId) {
        state.currentSubject = null;
        document.getElementById('no-subject-selected').style.display = 'flex';
        document.getElementById('subject-details').style.display = 'none';
    }
    
    saveSubjects();
    renderSubjects();
}

function saveNotes() {
    if (!state.currentSubject) return;
    
    state.currentSubject.notes = document.getElementById('notes-content').value;
    saveSubjects();
    
    // Show success message
    const toast = document.createElement('div');
    toast.classList.add('toast', 'success');
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Notes saved successfully!</span>
    `;
    document.body.appendChild(toast);
    
    // Show and remove toast
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function handleDocumentUpload(e) {
    e.preventDefault();
    
    if (!state.currentSubject) {
        alert('Please select a subject first');
        return;
    }
    
    const name = document.getElementById('document-name').value.trim();
    const file = document.getElementById('document-file').files[0];
    const url = document.getElementById('document-url').value.trim();
    
    if (!name) {
        alert('Please provide a document name');
        return;
    }
    
    if (!file && !url) {
        alert('Please either upload a file or enter a URL');
        return;
    }
    
    let documentUrl = url;
    let fileName = '';
    
    if (file) {
        // Create a blob URL for the file
        documentUrl = URL.createObjectURL(file);
        fileName = file.name;
    }
    
    const newDocument = {
        id: Date.now().toString(),
        name,
        url: documentUrl,
        fileName: fileName,
        uploadedAt: new Date().toISOString()
    };
    
    // Add the document to the current subject
    if (!state.currentSubject.documents) {
        state.currentSubject.documents = [];
    }
    state.currentSubject.documents.push(newDocument);
    
    // Save to local storage
    saveSubjects();
    
    // Show success message
    const toast = document.createElement('div');
    toast.classList.add('toast', 'success');
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Document uploaded successfully!</span>
    `;
    document.body.appendChild(toast);
    
    // Show and remove toast
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
    
    // Reset form and update UI
    e.target.reset();
    renderDocuments();
}

function renderDocuments() {
    if (!state.currentSubject) return;
    
    const documentsContainer = document.getElementById('documents-container');
    documentsContainer.innerHTML = '';
    
    if (!state.currentSubject.documents || state.currentSubject.documents.length === 0) {
        const noDocuments = document.createElement('li');
        noDocuments.textContent = 'No documents uploaded yet';
        noDocuments.style.color = 'var(--text-light)';
        noDocuments.style.textAlign = 'center';
        noDocuments.style.padding = '1rem';
        documentsContainer.appendChild(noDocuments);
        return;
    }
    
    state.currentSubject.documents.forEach(document => {
        const documentItem = document.createElement('li');
        documentItem.classList.add('document-item');
        
        documentItem.innerHTML = `
            <div class="document-name">
                <i class="fas fa-file-alt"></i>
                ${document.name}
                ${document.fileName ? `<span class="file-name">(${document.fileName})</span>` : ''}
            </div>
            <div class="document-actions">
                <button class="view-btn" title="View document"><i class="fas fa-external-link-alt"></i></button>
                <button class="delete-btn" title="Delete document"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        documentItem.querySelector('.view-btn').addEventListener('click', () => {
            if (document.url.startsWith('blob:')) {
                // For blob URLs, open in a new window
                window.open(document.url, '_blank');
            } else {
                // For regular URLs, try to download or open
                const a = document.createElement('a');
                a.href = document.url;
                a.target = '_blank';
                a.download = document.fileName || document.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        });
        
        documentItem.querySelector('.delete-btn').addEventListener('click', () => deleteDocument(document.id));
        
        documentsContainer.appendChild(documentItem);
    });
}

function deleteDocument(documentId) {
    if (!state.currentSubject) return;
    
    if (confirm('Are you sure you want to delete this document?')) {
        const document = state.currentSubject.documents.find(doc => doc.id === documentId);
        if (document && document.url.startsWith('blob:')) {
            // Revoke the blob URL to free up memory
            URL.revokeObjectURL(document.url);
        }
        
        state.currentSubject.documents = state.currentSubject.documents.filter(doc => doc.id !== documentId);
        saveSubjects();
        renderDocuments();
    }
}

function handleAddGrade(e) {
    e.preventDefault();
    
    if (!state.currentSubject) {
        alert('Please select a subject first');
        return;
    }
    
    const name = document.getElementById('exam-name').value.trim();
    const score = parseFloat(document.getElementById('exam-score').value);
    const date = document.getElementById('exam-date').value;
    
    if (!name || isNaN(score) || !date) {
        alert('Please fill in all fields');
        return;
    }
    
    const newGrade = {
        id: Date.now().toString(),
        name,
        score,
        date,
        addedAt: new Date().toISOString()
    };
    
    state.currentSubject.grades.push(newGrade);
    saveSubjects();
    
    e.target.reset();
    renderGrades();
}

function renderGrades() {
    if (!state.currentSubject) return;
    
    const gradesContainer = document.getElementById('grades-container');
    const averageScore = document.getElementById('average-score');
    gradesContainer.innerHTML = '';
    
    if (state.currentSubject.grades.length === 0) {
        const noGrades = document.createElement('tr');
        noGrades.innerHTML = '<td colspan="4" style="text-align: center; color: var(--text-light);">No grades added yet</td>';
        gradesContainer.appendChild(noGrades);
        averageScore.textContent = 'N/A';
        return;
    }
    
    // Sort grades by date (newest first)
    const sortedGrades = [...state.currentSubject.grades].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    sortedGrades.forEach(grade => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${grade.name}</td>
            <td>${grade.score}%</td>
            <td>${formatDate(grade.date)}</td>
            <td>
                <button class="delete-btn" title="Delete grade">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        row.querySelector('.delete-btn').addEventListener('click', () => deleteGrade(grade.id));
        
        gradesContainer.appendChild(row);
    });
    
    // Calculate and display average
    const average = sortedGrades.reduce((sum, grade) => sum + grade.score, 0) / sortedGrades.length;
    averageScore.textContent = `${average.toFixed(1)}%`;
}

function deleteGrade(gradeId) {
    if (!state.currentSubject) return;
    
    if (confirm('Are you sure you want to delete this grade?')) {
        state.currentSubject.grades = state.currentSubject.grades.filter(grade => grade.id !== gradeId);
        saveSubjects();
        renderGrades();
    }
} 