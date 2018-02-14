/* TO DO

Use document ready
Use max value for title
Icon for new note
Save last note selected and trigger click
Remove spellcheck


*/


setTimeout(init, 2000);


function init() {

var currentNote = 1;
var tempNotes = [
  {
    noteNum: 1,
    title: 'This is my title',
    noteText: 'Here is some example text',
  },
  {
    noteNum: 2,
    title: 'This is my title2',
    noteText: 'Here is some examksakdf;asple text',
  },
  {
    noteNum: 3,
    title: 'This is my title3',
    noteText: 'Here is som323e example text',
  },
];
tempNotes = JSON.stringify(tempNotes);
var notes = JSON.parse(tempNotes);

// if (window.localStorage.notes) {
//   notes = JSON.parse(window.localStorage.notes);
// } else {
//   notes = [];
// }


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
});


// Save note title
var titleEditor = document.querySelector('#title-editor');
titleEditor.addEventListener('keyup', function() {
  var note = getCurrentNoteObj();
  note.title = titleEditor.value;
  populateNotes();
});


// Save note text
var noteEditor = document.querySelector('#note-editor');
noteEditor.addEventListener('keyup', function() {
  
  var note = getCurrentNoteObj();
  note.noteText = noteEditor.value;
});


// Change notes
document.querySelector('#note-list').addEventListener('click', function(e) {
  if (e.target.tagName !== 'LI') return;
  
  currentNote = Number(e.target.getAttribute('data-note-num'));
  
  var note = getCurrentNoteObj();
  
  document.querySelector('#title-editor').value = note.title;
  document.querySelector('#note-editor').value = note.noteText;

}, true);

// Trigger click on current note
var lastClickedNote = document.querySelector('[data-note-num="' + currentNote + '"]');
lastClickedNote.dispatchEvent(new Event('click'));


function populateNotes() {
  document.querySelector('#note-list').innerHTML = '';
  notes.forEach(function(note) {
    var li = document.createElement('li');
    li.innerText = note.title;
    li.setAttribute('data-note-num', note.noteNum);
    document.querySelector('#note-list').appendChild(li);
  });
}

function getCurrentNoteObj() {
  return notes.find(function(note) {
    return note.noteNum === currentNote;
  });
}
}