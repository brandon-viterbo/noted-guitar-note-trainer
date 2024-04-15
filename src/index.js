const utils = require('./utils');

function changeGuitarModel(guitar, allNotes, newTuning, newStrings) {
  let i;
  let j;
  let baseNote;
  let baseNotePosition;
  let nextNotePosition;
  const fretboard = [];
  const noteRegex = /[A-G](b|#)?/g;
  const notesPresent = noteRegex.test(newTuning);
  let notesOfTuning;
  const newGuitar = guitar;

  if (notesPresent) {
    notesOfTuning = newTuning.match(noteRegex).reverse();
  } else {
    notesOfTuning = [];
  }

  if (!utils.validateTuning(newTuning, newStrings)) {
    return;
  }

  newGuitar.tuningStr = newTuning;
  newGuitar.strings = newStrings;

  function generateFretboard() {
    for (i = 0; i < newStrings; i += 1) {
      fretboard[i] = [];
      baseNote = notesOfTuning[i];
      baseNotePosition = allNotes.indexOf(baseNote);
      for (j = 0; j <= guitar.frets; j += 1) {
        nextNotePosition = Math.floor((baseNotePosition + j * 2) / 2) * 2;
        if (nextNotePosition >= allNotes.length) {
          nextNotePosition %= allNotes.length;
        }
        fretboard[i][j] = [allNotes[nextNotePosition], allNotes[nextNotePosition + 1]];
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

function makeQuestionAndAnswer(guitar, minString, maxString, minFret, maxFret, selectedMode) {
  let foundErr = true;
  let questionAndAnswer;

  function helper() {
    const string = Math.floor(Math.random() * (maxString - minString + 1)) + minString;
    const fret = Math.floor(Math.random() * (maxFret - minFret + 1)) + minFret;
    const note = guitar.fretboard[string - 1][fret];
    const zeroOrOne = Math.floor(Math.random() * (2));
    // return array in form of [question, answer]
    if (selectedMode === 'identifyMode') {
      return [`String ${string}, fret ${fret} is the note...`, note];
    } if (selectedMode === 'locateMode') {
      // Multiple answers, we handle this outside the function.
      return [`The note ${note[zeroOrOne]} is located on 'string, fret'.`, note];
    }
    throw new Error('ERROR: Selected Training Mode is not valid!');
  }

  while (foundErr) {
    try {
      questionAndAnswer = helper(guitar, minString, maxString, minFret, maxFret, selectedMode);
      foundErr = false;
    } catch (err) {
      questionAndAnswer = -1;
    }
  }

  return questionAndAnswer;
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

const guitarViewID = 'guitarInfo';
const answerInput = document.getElementById('answerInput');
const answerButton = document.getElementById('answerButton');
const testSettingErrorPrompt = document.getElementById('badRange');
const tuningErrorPrompt = document.getElementById('badTuning');
window.onload = () => {
  generateNoOfStringsOptions(guitarModel.strings);
  answerInput.style.display = 'none';
  answerButton.style.display = 'none';
  testSettingErrorPrompt.style.display = 'none';
  tuningErrorPrompt.style.display = 'none';
};
changeGuitarModel(guitarModel, twelveNotes, 'EADGBE', 6);
guitarModel.updateView(guitarViewID);

// MVC pattern here. settingsForm is the controller...
const settingsForm = document.getElementById('settingsForm');
settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const submittedTuningStr = document.getElementById('customTuning').value;
  const submittedStringsStr = document.getElementById('submittedStrings').value;

  tuningErrorPrompt.style.display = 'none';

  if (!utils.validateTuning(submittedTuningStr, submittedStringsStr)) {
    tuningErrorPrompt.style.display = 'block';
  }

  // which changes the guitar model, which then updates the HTML view element.
  changeGuitarModel(guitarModel, twelveNotes, submittedTuningStr, submittedStringsStr);
  guitarModel.updateView(guitarViewID);
});

const testOptions = document.getElementById('testOptions');
const testPrompt = document.getElementById('testPrompt');
const testInputs = document.getElementById('testInputs');
const feedbackElement = document.getElementById('testFeedback');
const settingsSubmitButton = document.getElementById('settingsSubmit');
const startTestButton = document.getElementById('startTestSubmit');
let minStr;
let maxStr;
let minFr;
let maxFr;
let selMode;
let question;
let corrAns;
let questionsToAnswer;
let questionsLeft;
let correct;

testOptions.addEventListener('submit', (e) => {
  e.preventDefault();
  const rangeOfStringsVal = document.getElementById('rangeOfStrings').value;
  const rangeOfFretsVal = document.getElementById('rangeOfFrets').value;
  const rangeOfStringsInts = utils.stringToTwoInts(rangeOfStringsVal, true);
  const rangeOfFretsInts = utils.stringToTwoInts(rangeOfFretsVal, true);
  const noOfQuestionsElement = document.getElementById('noOfQuestions');
  feedbackElement.innerHTML = '';

  if (rangeOfStringsInts === -1 || rangeOfFretsInts === -1) {
    testSettingErrorPrompt.style.display = 'block';
    return;
  }

  [minStr, maxStr] = rangeOfStringsInts;
  [minFr, maxFr] = rangeOfFretsInts;

  if (maxStr > guitarModel.strings || maxFr > guitarModel.frets) {
    testSettingErrorPrompt.style.display = 'block';
    return;
  }

  testSettingErrorPrompt.style.display = 'none';
  answerInput.style.display = 'block';
  answerButton.style.display = 'block';
  settingsSubmitButton.disabled = true;
  startTestButton.disabled = true;

  questionsToAnswer = noOfQuestionsElement.value;
  questionsLeft = questionsToAnswer;
  correct = 0;
  selMode = document.querySelector('input[name="testMode"]:checked').value;
  [question, corrAns] = makeQuestionAndAnswer(guitarModel, minStr, maxStr, minFr, maxFr, selMode);
  testPrompt.innerHTML = question;
});

testInputs.addEventListener('submit', (e) => {
  e.preventDefault();
  let submittedAnswer = answerInput.value;
  let isAnswerCorrect;
  let feedbackTxt = '';

  questionsLeft -= 1;
  answerInput.value = '';

  if (selMode === 'identifyMode') {
    isAnswerCorrect = corrAns.includes(utils.removeWhiteSpace(submittedAnswer));
  } else {
    submittedAnswer = utils.stringToTwoInts(`${submittedAnswer}`, false);
    if (submittedAnswer === -1) {
      feedbackTxt = ', bad format';
      isAnswerCorrect = false;
    } else {
      const [ansString, ansFret] = submittedAnswer;
      const ansStringInRange = (minStr <= ansString && ansString <= maxStr);
      const ansFretInRange = (minFr <= ansFret && ansFret <= maxFr);
      if (!(ansStringInRange && ansFretInRange)) {
        feedbackTxt = ', out of range';
        isAnswerCorrect = false;
      } else {
        const toMatch = guitarModel.fretboard[ansString - 1][ansFret];
        isAnswerCorrect = corrAns[0] === toMatch[0] && corrAns[1] === toMatch[1];
      }
    }
  }

  if (isAnswerCorrect) {
    correct += 1;
    feedbackTxt = `Answered correctly with ${submittedAnswer}!`;
  } else {
    feedbackTxt = `Answered incorrectly${feedbackTxt}!`;
  }

  feedbackElement.innerHTML = feedbackTxt;

  if (questionsLeft === 0) {
    testPrompt.innerHTML = `Test done! Your score is: ${correct}/${questionsToAnswer}`;
    answerInput.style.display = 'none';
    answerButton.style.display = 'none';
    settingsSubmitButton.disabled = false;
    startTestButton.disabled = false;
    return;
  }

  [question, corrAns] = makeQuestionAndAnswer(guitarModel, minStr, maxStr, minFr, maxFr, selMode);
  testPrompt.innerHTML = question;
});
