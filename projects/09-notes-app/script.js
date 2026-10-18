let notes = JSON.parse(localStorage.getItem('notes')) || [];
let currentView = 'all';

const notesGrid = document.getElementById('notesGrid');
const addNoteBtn = document.getElementById('addNoteBtn');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('themeToggle');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const fileInput = document.getElementById('fileInput');
const modal = document.getElementById('modal');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

let editingId = null;

// Theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
});

addNoteBtn.addEventListener('click', () => openModal());

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.filter;
    render();
  });
});

searchInput.addEventListener('input', render);

saveBtn.addEventListener('click', saveNote);
cancelBtn.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

exportBtn.addEventListener('click', () => {
  const dataStr = JSON.stringify(notes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notes-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        notes = [...notes, ...imported];
        saveToStorage();
        render();
      }
    } catch (err) {
      alert('Invalid file: ' + err.message);
    }
  };
  reader.readAsText(file);
  fileInput.value = '';
});

function openModal(id = null) {
  editingId = id;
  
  if (id) {
    const note = notes.find(n => n.id === id);
    noteTitle.value = note.title;
    noteContent.value = note.content;
  } else {
    noteTitle.value = '';
    noteContent.value = '';
  }
  
  modal.classList.add('active');
  noteTitle.focus();
}

function closeModal() {
  modal.classList.remove('active');
  editingId = null;
}

function saveNote() {
  const title = noteTitle.value.trim();
  const content = noteContent.value.trim();
  
  if (!title || !content) {
    alert('Please fill both title and content');
    return;
  }

  if (editingId) {
    const note = notes.find(n => n.id === editingId);
    note.title = title;
    note.content = content;
    note.updatedAt = new Date().toISOString();
  } else {
    const note = {
      id: Date.now(),
      title,
      content,
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.unshift(note);
  }

  saveToStorage();
  render();
  closeModal();
}

function togglePin(id) {
  const note = notes.find(n => n.id === id);
  note.pinned = !note.pinned;
  saveToStorage();
  render();
}

function deleteNote(id) {
  if (confirm('Delete this note?')) {
    notes = notes.filter(n => n.id !== id);
    saveToStorage();
    render();
  }
}

function render() {
  const search = searchInput.value.toLowerCase();
  
  let filtered = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(search) || 
                         note.content.toLowerCase().includes(search);
    const matchesFilter = currentView === 'all' || 
                         (currentView === 'pinned' && note.pinned);
    return matchesSearch && matchesFilter;
  });

  // Sort: pinned first, then by updated date
  filtered.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  if (filtered.length === 0) {
    notesGrid.innerHTML = '<div class="empty-state">📝 No notes found. Create your first note!</div>';
  } else {
    notesGrid.innerHTML = filtered.map(note => `
      <div class="note-card ${note.pinned ? 'pinned' : ''}">
        <div class="note-header">
          <h3 class="note-title">${escapeHtml(note.title)}</h3>
          <button onclick="togglePin(${note.id})" class="icon-btn" title="${note.pinned ? 'Unpin' : 'Pin'}">
            ${note.pinned ? '📌' : '📍'}
          </button>
        </div>
        <div class="note-content">${escapeHtml(note.content)}</div>
        <div class="note-footer">
          <span class="note-date">${formatDate(note.updatedAt)}</span>
          <div class="note-actions">
            <button onclick="openModal(${note.id})" class="icon-btn">✏️</button>
            <button onclick="deleteNote(${note.id})" class="icon-btn">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}

function saveToStorage() {
  localStorage.setItem('notes', JSON.stringify(notes));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

render();
