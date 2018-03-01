var notes;
var currentNote;

chrome.storage.sync.get('notes', function(noteObj) {
  notes = noteObj.notes || [];

  chrome.storage.sync.get('currentNote', function(cn_Obj) {
    currentNote = cn_Obj.currentNote || 0;
    init();
  });
});

function init() {

  populateNotes();


  // New note
  document.querySelector('#new-note').addEventListener('click', function() {
    
    var newNoteID = parseInt(Math.random() * 1000000);
    currentNote = newNoteID;
    
    var newli = document.createElement('li');
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

    chrome.storage.sync.set({notes}, function() {
      console.log('New note added!');
      populateNotes();
    });
  });


  // Delete note
  document.querySelector('#delete-note').addEventListener('click', function() {
    var noteIdToDelete = getCurrentNoteObj().noteNum;
    
    notes = notes.filter(function(note) {
      return note.noteNum !== noteIdToDelete;
    });
    
    populateNotes();
    
    document.querySelector('#title-editor').value = '';
    document.querySelector('#note-editor').value = '';

    chrome.storage.sync.set({notes}, function() {
      console.log('Note deleted!');
      disableEditor();
    });

  });


  // Save note title
  var titleEditor = document.querySelector('#title-editor');
  var title_cb = debounce(function() {

    var note = getCurrentNoteObj();
    note.title = titleEditor.value;
    populateNotes();

    chrome.storage.sync.set({notes}, function() {
      console.log('Note title saved!');
    });

  }, 200);
  titleEditor.addEventListener('keyup', title_cb);


  // Save note text
  var noteText_cb = debounce(function() {

    var note = getCurrentNoteObj();
    note.noteText = noteEditor.value;

    chrome.storage.sync.set({notes}, function() {
      console.log('Note text saved!');
    });

  }, 200);
  var noteEditor = document.querySelector('#note-editor');
  ['click', 'paste'].forEach((event) => {
    noteEditor.addEventListener(event, noteText_cb);
  });


  // Change notes
  document.querySelector('#note-list').addEventListener('click', function(e) {
    if (e.target.tagName !== 'LI') return;
    
    currentNote = Number(e.target.getAttribute('data-note-num'));
    
    var note = getCurrentNoteObj();
    
    document.querySelector('#title-editor').value = note.title;
    document.querySelector('#note-editor').value = note.noteText;

    chrome.storage.sync.set({currentNote}, function() {
      console.log('Current note saved!');
      enableEditor();
    });

  }, true);

  // Trigger click on current note
  var lastClickedNote = document.querySelector('[data-note-num="' + currentNote + '"]');
  if (lastClickedNote) {
    lastClickedNote.dispatchEvent(new Event('click')); 
  }



}


function populateNotes() {
  document.querySelector('#note-list').innerHTML = '';
  notes.forEach(function(note) {
    var li = document.createElement('li');
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
  return notes.find(function(note) {
    return note.noteNum === currentNote;
  });
}

function disableEditor() {
  var noteEditor = document.querySelector('#note-editor');
  noteEditor.classList.add('disabled');
  noteEditor.setAttribute('disabled', true);
  Array.from(document.querySelectorAll('#title-editor, #delete-note')).forEach(function(el) {
    el.classList.add('disabled');
  });
}

function enableEditor() {
  var noteEditor = document.querySelector('#note-editor');
  noteEditor.classList.remove('disabled');
  noteEditor.removeAttribute('disabled', false);
  Array.from(document.querySelectorAll('#title-editor, #delete-note')).forEach(function(el) {
    el.classList.remove('disabled');
  });
}

function debounce(fn, wait, leading = false) {
  var timeout;

  return function(...args) {
    function later() {
      timeout = null;
      if (!leading) fn(...args);
    }

    var callNow = leading && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) fn(...args);
  };
}