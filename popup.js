let notes;
let currentNote;

async function loadData() {
  try {
    const noteObj = await chrome.storage.sync.get('notes');
    notes = noteObj.notes || [];

    const cn_Obj = await chrome.storage.sync.get('currentNote');
    currentNote = cn_Obj.currentNote || 0;

    init();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

loadData();

function init() {
  populateNotes();

  // New note
  document
    .querySelector('#new-note')
    .addEventListener('click', async function () {
      const newNoteID = parseInt(Math.random() * 1000000);
      currentNote = newNoteID;

      const newli = document.createElement('li');
      newli.innerText = 'New Note';

      newli.setAttribute('data-note-num', newNoteID);
      document.querySelector('#note-list').appendChild(newli);

      document.querySelector('#title-editor').value = '';
      document.querySelector('#note-editor').value = '';

      notes.push({
        noteNum: newNoteID,
        title: 'New Note',
        noteText: '',
      });

      try {
        await chrome.storage.sync.set({ notes });
        console.log('New note added!');
        populateNotes();

        await chrome.storage.sync.set({ currentNote });
        console.log('Current note saved!');
      } catch (error) {
        console.error('Error saving new note:', error);
      }
    });

  // Delete note
  document
    .querySelector('#delete-note')
    .addEventListener('click', async function () {
      const noteToDelete = getCurrentNoteObj();
      if (!noteToDelete) return;

      const noteIdToDelete = noteToDelete.noteNum;
      const noteTitleToDelete = noteToDelete.title;

      const confirmDelete = window.confirm(
        'Are you sure you want to delete ' + noteTitleToDelete + '?'
      );
      if (!confirmDelete) return;

      notes = notes.filter(function (note) {
        return note.noteNum !== noteIdToDelete;
      });

      populateNotes();

      document.querySelector('#title-editor').value = '';
      document.querySelector('#note-editor').value = '';

      try {
        await chrome.storage.sync.set({ notes });
        console.log('Note deleted!');
        disableEditor();
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    });

  // Save note title
  const titleEditor = document.querySelector('#title-editor');
  titleEditor.addEventListener('blur', async function () {
    const note = getCurrentNoteObj();
    if (!note) return;

    note.title = titleEditor.value;
    populateNotes();

    try {
      await chrome.storage.sync.set({ notes });
      console.log('Note title saved!');
    } catch (error) {
      console.error('Error saving note title:', error);
    }
  });

  // Save note text
  const noteEditor = document.querySelector('#note-editor');
  noteEditor.addEventListener('blur', async function () {
    const note = getCurrentNoteObj();
    if (!note) return;

    note.noteText = noteEditor.value;

    try {
      await chrome.storage.sync.set({ notes });
      console.log('Note text saved!');
    } catch (error) {
      console.error('Error saving note text:', error);
    }
  });

  // Change notes
  document.querySelector('#note-list').addEventListener(
    'click',
    async function (e) {
      if (e.target.tagName !== 'LI') return;

      currentNote = Number(e.target.getAttribute('data-note-num'));

      const note = getCurrentNoteObj();
      if (!note) return;

      document.querySelector('#title-editor').value = note.title;
      document.querySelector('#note-editor').value = note.noteText;

      try {
        await chrome.storage.sync.set({ currentNote });
        console.log('Current note saved!');
        enableEditor();
      } catch (error) {
        console.error('Error saving current note:', error);
      }
    },
    true
  );

  // Trigger click on current note
  const lastClickedNote = document.querySelector(
    '[data-note-num="' + currentNote + '"]'
  );
  if (lastClickedNote) {
    lastClickedNote.dispatchEvent(new Event('click'));
  }
}

function populateNotes() {
  document.querySelector('#note-list').innerHTML = '';
  notes.forEach(function (note) {
    const li = document.createElement('li');
    li.innerText = note.title;
    li.setAttribute('data-note-num', note.noteNum);
    document.querySelector('#note-list').appendChild(li);
  });

  if (!document.querySelectorAll('#note-list li').length) {
    disableEditor();
  } else {
    enableEditor();
  }
}

function getCurrentNoteObj() {
  return notes.find(function (note) {
    return note.noteNum === currentNote;
  });
}

function disableEditor() {
  const noteEditor = document.querySelector('#note-editor');
  noteEditor.classList.add('disabled');
  noteEditor.setAttribute('disabled', true);
  Array.from(document.querySelectorAll('#title-editor, #delete-note')).forEach(
    function (el) {
      el.classList.add('disabled');
    }
  );
}

function enableEditor() {
  const noteEditor = document.querySelector('#note-editor');
  noteEditor.classList.remove('disabled');
  noteEditor.removeAttribute('disabled');
  Array.from(document.querySelectorAll('#title-editor, #delete-note')).forEach(
    function (el) {
      el.classList.remove('disabled');
    }
  );
}

function debounce(fn, wait, leading = false) {
  let timeout;

  return function (...args) {
    function later() {
      timeout = null;
      if (!leading) fn(...args);
    }

    const callNow = leading && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) fn(...args);
  };
}
