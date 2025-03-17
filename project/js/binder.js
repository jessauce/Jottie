import { state, saveSubjects } from './state.js';
import { formatDate } from './utils.js';

export function initBinder() {
    const addSubjectForm = document.getElementById('add-subject-form');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const saveNotesButton = document.getElementById('save-notes');
    const documentUploadForm = document.getElementById('document-upload-form');
    const addGradeForm = document.getElementById('add-grade-form');
    
    addSubjectForm.addEventListener('submit', handleAddSubject);
    tabButtons.forEach(button => {
        button.addEventListener('click', handleTabClick);
    });
    saveNotesButton.addEventListener('click', saveNotes);
    documentUploadForm.addEventListener('submit', handleDocumentUpload);
    addGradeForm.addEventListener('submit', handleAddGrade);
    
    renderSubjects();
}

function handleTabClick() {
    const targetTab = this.getAttribute('data-tab');
    
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    
    // Show target tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${targetTab}-tab`).classList.add('active');
}

function handleAddSubject(e) {
    e.preventDefault();
    
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
    
    e.target.reset();
    renderSubjects();
}

function renderSubjects() {
    const subjectsList = document.getElementById('subjects-list');
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
    
    document.getElementById('no-subject-selected').style.display = 'none';
    document.getElementById('subject-details').style.display = 'block';
    
    document.getElementById('current-subject-name').textContent = subject.name;
    
    // Load subject data
    document.getElementById('notes-content').value = subject.notes || '';
    
    renderDocuments();
    renderGrades();
}

function deleteSubject(subjectId) {
    if (confirm('Are you sure you want to delete this subject? All notes, documents, and grades will be lost.')) {
        state.subjects = state.subjects.filter(subject => subject.id !== subjectId);
        
        if (state.currentSubject && state.currentSubject.id === subjectId) {
            state.currentSubject = null;
            document.getElementById('no-subject-selected').style.display = 'flex';
            document.getElementById('subject-details').style.display = 'none';
        }
        
        saveSubjects();
        renderSubjects();
    }
}

function saveNotes() {
    if (!state.currentSubject) return;
    
    state.currentSubject.notes = document.getElementById('notes-content').value;
    saveSubjects();
    
    alert('Notes saved successfully!');
}

function handleDocumentUpload(e) {
    e.preventDefault();
    
    if (!state.currentSubject) return;
    
    const name = document.getElementById('document-name').value;
    const file = document.getElementById('document-file').files[0];
    const url = document.getElementById('document-url').value;
    
    if (!name || (!file && !url)) {
        alert('Please provide a document name and either upload a file or enter a URL.');
        return;
    }
    
    let documentUrl = url;
    
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
    
    e.target.reset();
    renderDocuments();
}

function renderDocuments() {
    if (!state.currentSubject) return;
    
    const documentsContainer = document.getElementById('documents-container');
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
            window.open(document.url, '_blank');
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

function handleAddGrade(e) {
    e.preventDefault();
    
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