class NotesManager {
    constructor() {
        this.currentSubject = null;
        this.currentNote = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.notesPreviewList = document.getElementById('notes-preview-list');
        this.noteEditor = document.querySelector('.note-editor');
        this.noteTitle = document.getElementById('note-title');
        this.noteContent = document.getElementById('note-content');
        this.addNoteBtn = document.getElementById('add-note-btn');
        this.saveNoteBtn = document.getElementById('save-note');
        this.backToNotesBtn = document.getElementById('back-to-notes');
        this.editorTools = document.querySelectorAll('.editor-tools button');
        // Add format state tracking
        this.formatState = {};
    }

    attachEventListeners() {
        this.addNoteBtn.addEventListener('click', () => this.createNewNote());
        this.saveNoteBtn.addEventListener('click', () => this.saveNote());
        this.backToNotesBtn.addEventListener('click', () => this.showNotesList());
        
        this.editorTools.forEach(button => {
            button.addEventListener('click', (e) => {
                const command = button.dataset.command;
                const value = button.dataset.value || '';
                
                if (command === 'insertHTML') {
                    // Handle checklist items
                    const selection = window.getSelection();
                    if (selection.toString().length > 0) {
                        const checkbox = '<input type="checkbox"> ' + selection.toString();
                        document.execCommand('insertHTML', false, checkbox);
                    } else {
                        document.execCommand('insertHTML', false, '<input type="checkbox"> ');
                    }
                } else if (command === 'backColor') {
                    // Handle highlighting
                    document.execCommand(command, false, '#ffeb3b');
                } else {
                    document.execCommand(command, false, value);
                }
                
                // Toggle active state for formatting buttons
                if (['bold', 'italic'].includes(command)) {
                    button.classList.toggle('active', document.queryCommandState(command));
                }
            });
        });
        
        // Track format state changes
        this.noteContent.addEventListener('keyup', this.updateToolbarState.bind(this));
        this.noteContent.addEventListener('mouseup', this.updateToolbarState.bind(this));
    }

    updateToolbarState() {
        this.editorTools.forEach(button => {
            const command = button.dataset.command;
            if (['bold', 'italic'].includes(command)) {
                button.classList.toggle('active', document.queryCommandState(command));
            }
        });
    }

    showNotesList() {
        this.noteEditor.style.display = 'none';
        this.notesPreviewList.parentElement.style.display = 'block';
        this.loadNotes();
    }

    loadNotes() {
        if (!this.currentSubject) return;
        
        const notes = this.getNotes(this.currentSubject);
        this.notesPreviewList.innerHTML = notes.map(note => `
            <div class="notes-preview-item" data-note-id="${note.id}">
                <h4>${note.title}</h4>
                <p>${this.truncateHTML(note.content, 100)}</p>
                <small>Last modified: ${new Date(note.lastModified).toLocaleDateString()}</small>
            </div>
        `).join('');

        this.notesPreviewList.querySelectorAll('.notes-preview-item').forEach(item => {
            item.addEventListener('click', () => this.openNote(item.dataset.noteId));
        });
    }

    createNewNote() {
        this.currentNote = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '',
            lastModified: new Date()
        };
        this.openNoteEditor();
    }

    openNote(noteId) {
        const notes = this.getNotes(this.currentSubject);
        this.currentNote = notes.find(note => note.id === noteId);
        this.openNoteEditor();
    }

    openNoteEditor() {
        this.noteTitle.value = this.currentNote.title;
        this.noteContent.innerHTML = this.currentNote.content;
        this.notesPreviewList.parentElement.style.display = 'none';
        this.noteEditor.style.display = 'block';
    }

    saveNote() {
        if (!this.currentNote || !this.currentSubject) return;

        const notes = this.getNotes(this.currentSubject);
        const noteIndex = notes.findIndex(note => note.id === this.currentNote.id);

        const updatedNote = {
            ...this.currentNote,
            title: this.noteTitle.value,
            content: this.noteContent.innerHTML,
            lastModified: new Date()
        };

        if (noteIndex === -1) {
            notes.push(updatedNote);
        } else {
            notes[noteIndex] = updatedNote;
        }

        this.saveNotes(this.currentSubject, notes);
        this.showNotesList();
    }

    getNotes(subjectId) {
        const notesJSON = localStorage.getItem(`notes_${subjectId}`);
        return notesJSON ? JSON.parse(notesJSON) : [];
    }

    saveNotes(subjectId, notes) {
        localStorage.setItem(`notes_${subjectId}`, JSON.stringify(notes));
    }

    truncateHTML(html, maxLength) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent;
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    }

    setCurrentSubject(subjectId) {
        this.currentSubject = subjectId;
        this.showNotesList();
    }
}

export default NotesManager;
