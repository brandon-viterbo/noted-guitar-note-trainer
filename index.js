function validateTuning(submittedTuningStr, submittedStringsStr) {
  // tuningRegex matches a sequence of x valid notes, where x is the number of
  // strings on the user's guitar
  const tuningRegex = new RegExp(`^([A-G](b|#)?){${submittedStringsStr}}$`);
  const tuningStr = submittedTuningStr.replace(/\s+/g, '');

  const valid = tuningRegex.test(tuningStr);

  if (valid) {
    console.log(`${tuningStr} is a valid tuning`);
  } else {
    console.log(`${tuningStr} is an invalid tuning`);
  }

  return valid;
}

function validateSettings(submittedTuningStr, submittedStringsStr) {
  // Test check remote repo.
  const valid = validateTuning(submittedTuningStr, submittedStringsStr);

  if (valid) {
    console.log('All settings are valid.');
  } else {
    console.log('ERROR: At least one setting is invalid.');
  }

  return valid;
}

const twelveNotes = [
  'A', 'A',
  'A#', 'Bb',
  'B', 'Cb',
  'C', 'B#',
  'C#', 'Db',
  'D', 'D',
  'D#', 'Eb',
  'E', 'Fb',
  'F', 'E#',
  'F#', 'Gb',
  'G', 'G',
  'G#', 'Ab',
];

const defaultStringsNo = 6;
const noOffrets = 24;

const guitarModel = {
  tuningStr: 'EADGBE',
  frets: noOffrets,
  strings: defaultStringsNo,
  fretboard: null,
  updateView(viewElementID) {
    const view = document.getElementById(viewElementID);

    view.innerHTML = `Tuning is ${guitarModel.tuningStr}. Number of strings is ${guitarModel.strings}`;
  },
};

function changeGuitarModel(guitar, allNotes, newTuning, newStrings) {
  let i;
  let j;
  const fretboard = [];
  const noteRegex = /[A-G](b|#)?/g;
  const notesOfTuning = newTuning.match(noteRegex).reverse();
  const newGuitar = guitar;

  if (!validateSettings(newTuning, newStrings)) {
    console.log('Guitar model note changed');
    return;
  }

  console.log('Changing guitar model...');

  newGuitar.tuningStr = newTuning;
  newGuitar.strings = newStrings;

  function generateFretboard() {
    for (i = 0; i < newStrings; i += 1) {
      fretboard[i] = [];
      for (j = 0; j <= guitar.frets; j += 1) {
        if (j === 0) {
          fretboard[i][j] = notesOfTuning[i];
        } else {
          fretboard[i][j] = allNotes[j - 1];
        }
      }
    }
  }

  generateFretboard();
  newGuitar.fretboard = fretboard;
}

function generateNoOfStringsOptions(defaultNo) {
  const min = 4;
  const max = 8;
  const select = document.getElementById('submittedStrings');
  let i;

  for (i = min; i <= max; i += 1) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    if (i === defaultNo) {
      opt.selected = 'selected';
    }
    select.appendChild(opt);
  }
}

const viewElementID = 'guitarInfo';

window.onload = () => {
  generateNoOfStringsOptions(guitarModel.strings);
  guitarModel.updateView(viewElementID);
};

const settingsForm = document.getElementById('settingsForm');
settingsForm.addEventListener('submit', (e) => {
  console.log('Update request submitted...');
  e.preventDefault();
  const submittedTuningStr = document.getElementById('customTuning').value;
  const submittedStringsStr = document.getElementById('submittedStrings').value;

  changeGuitarModel(guitarModel, twelveNotes, submittedTuningStr, submittedStringsStr);
  guitarModel.updateView(viewElementID);
  console.log(guitarModel.fretboard);
});
