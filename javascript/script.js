// script.js
const API_URL = window.location.origin; // Points to your server

document.addEventListener('DOMContentLoaded', function() {
    const noteTitleInput = document.getElementById('note-title');
    const noteContentInput = document.getElementById('note-content');
    const addNoteButton = document.getElementById('add-note');
    const notesContainer = document.getElementById('notes-container');
    
    let editingNoteId = null;
    
    // Load notes from server
    loadNotes();
    
    // Add or update note
    addNoteButton.addEventListener('click', function() {
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();
        
        if (title && content) {
            if (editingNoteId !== null) {
                // Update existing note
                updateNote(editingNoteId, title, content);
            } else {
                // Add new note
                createNote(title, content);
            }
        }
    });
    
    // Load notes from server
    async function loadNotes() {
        try {
            const response = await fetch(`${API_URL}/api/notes`);
            const notes = await response.json();
            renderNotes(notes);
        } catch (error) {
            console.error('Error loading notes:', error);
            notesContainer.innerHTML = `
                <div class="error-message">
                    <p>Could not load notes. Please check your connection.</p>
                </div>
            `;
        }
    }
    
    // Create a new note
    async function createNote(title, content) {
        try {
            const response = await fetch(`${API_URL}/api/notes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content })
            });
            
            if (response.ok) {
                noteTitleInput.value = '';
                noteContentInput.value = '';
                loadNotes(); // Reload all notes
            }
        } catch (error) {
            console.error('Error creating note:', error);
        }
    }
    
    // Update a note
    async function updateNote(id, title, content) {
        try {
            const response = await fetch(`${API_URL}/api/notes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content })
            });
            
            if (response.ok) {
                noteTitleInput.value = '';
                noteContentInput.value = '';
                editingNoteId = null;
                addNoteButton.textContent = '➕ Add Note';
                loadNotes(); // Reload all notes
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    }
    
    // Delete a note
    async function deleteNote(id) {
        try {
            const response = await fetch(`${API_URL}/api/notes/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadNotes(); // Reload all notes
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    }
    
    // Render notes to the screen
    function renderNotes(notes) {
        notesContainer.innerHTML = '';
        
        if (notes.length === 0) {
            notesContainer.innerHTML = `
                <div class="no-notes">
                    <p>No notes yet! Create your first note above. 🎉</p>
                </div>
            `;
            return;
        }
        
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.innerHTML = `
                <h3>${escapeHtml(note.title)}</h3>
                <p>${escapeHtml(note.content)}</p>
                <div class="note-actions">
                    <button class="edit-btn" data-id="${note._id}">✏️</button>
                    <button class="delete-btn" data-id="${note._id}">🗑️</button>
                </div>
            `;
            notesContainer.appendChild(noteElement);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editNote(id, notes);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this note?')) {
                    deleteNote(id);
                }
            });
        });
    }
    
    // Edit note
    function editNote(id, notes) {
        const noteToEdit = notes.find(note => note._id === id);
        if (noteToEdit) {
            noteTitleInput.value = noteToEdit.title;
            noteContentInput.value = noteToEdit.content;
            editingNoteId = id;
            addNoteButton.textContent = '💾 Update Note';
            
            // Scroll to the input area
            noteTitleInput.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Helper function to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});