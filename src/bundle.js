(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    console.log('Guitar model NOT changed');
    return;
  }

  console.log('Changing guitar model...');

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

const viewElementID = 'guitarInfo';

window.onload = () => {
  generateNoOfStringsOptions(guitarModel.strings);
};
changeGuitarModel(guitarModel, twelveNotes, 'EADGBE', 6);
guitarModel.updateView(viewElementID);

// MVC pattern here. settingsForm is the controller...
const settingsForm = document.getElementById('settingsForm');
settingsForm.addEventListener('submit', (e) => {
  console.log('Update request submitted...');
  e.preventDefault();
  const submittedTuningStr = document.getElementById('customTuning').value;
  const submittedStringsStr = document.getElementById('submittedStrings').value;

  // which changes the guitar model, which then updates the HTML view element.
  changeGuitarModel(guitarModel, twelveNotes, submittedTuningStr, submittedStringsStr);
  guitarModel.updateView(viewElementID);
});

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
      console.log(`Note selected on string ${string}, fret ${fret}`);
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

const answerInput = document.getElementById('answerInput');
const testOptions = document.getElementById('testOptions');
const noOfQuestionsElement = document.getElementById('noOfQuestions');
const testPrompt = document.getElementById('testPrompt');
const testInputs = document.getElementById('testInputs');
let minStr;
let maxStr;
let minFr;
let maxFr;
let selMode;
let questionAndAnswer;
let question;
let correctAnswer;
let isAnswerCorrect;
let questionsToAnswer;
let questionsLeft;
let correct;

testOptions.addEventListener('submit', (e) => {
  e.preventDefault();
  const rangeOfStringsVal = document.getElementById('rangeOfStrings').value;
  const rangeOfFretsVal = document.getElementById('rangeOfFrets').value;
  const rangeOfStringsInts = utils.stringToTwoInts(rangeOfStringsVal, true);
  const rangeOfFretsInts = utils.stringToTwoInts(rangeOfFretsVal, true);

  if (rangeOfStringsInts === -1 || rangeOfFretsInts === -1) {
    console.log('ERROR: One of the ranges is not in a valid form!');
    return;
  }

  [minStr, maxStr] = rangeOfStringsInts;
  [minFr, maxFr] = rangeOfFretsInts;

  if (maxStr > guitarModel.strings || maxFr > guitarModel.frets) {
    console.log('ERROR: String or fret range exceeds that of the guitar!');
    return;
  }

  questionsToAnswer = noOfQuestionsElement.value;
  questionsLeft = questionsToAnswer;
  correct = 0;
  selMode = document.querySelector('input[name="testMode"]:checked').value;
  questionAndAnswer = makeQuestionAndAnswer(guitarModel, minStr, maxStr, minFr, maxFr, selMode);
  console.log('Starting test...');
  [question, correctAnswer] = questionAndAnswer;

  testPrompt.innerHTML = question;
});

testInputs.addEventListener('submit', (e) => {
  e.preventDefault();
  let submittedAnswer = answerInput.value;

  console.log(`Submitted ${submittedAnswer} for question ${question}`);
  questionsLeft -= 1;
  answerInput.value = '';

  if (selMode === 'identifyMode') {
    isAnswerCorrect = correctAnswer.includes(utils.removeWhiteSpace(submittedAnswer));
  } else {
    submittedAnswer = utils.stringToTwoInts(`${submittedAnswer}`, false);
    if (submittedAnswer === -1) {
      console.log('Answer incorrect, bad format');
    } else {
      isAnswerCorrect = false;
      const [ansString, ansFret] = utils.stringToTwoInts(`${submittedAnswer}`, false);

      const ansStringInRange = (minStr <= ansString && ansString <= maxStr);
      const ansFretInRange = (minFr <= ansFret && ansFret <= maxFr);
      if (!(ansStringInRange || ansFretInRange)) {
        console.log('Answer incorrect, out of range!');
        isAnswerCorrect = false;
      } else {
        const toMatch = guitarModel.fretboard[ansString - 1][ansFret];
        console.log(`${correctAnswer} toMatch is ${toMatch}`);
        isAnswerCorrect = correctAnswer[0] === toMatch[0] && correctAnswer[1] === toMatch[1];
      }
    }
  }

  if (isAnswerCorrect) {
    correct += 1;
    console.log(`Answered correctly with ${submittedAnswer}!`);
  } else {
    console.log(`Answered incorrectly with ${submittedAnswer}!`);
  }

  if (questionsLeft === 0) {
    testPrompt.innerHTML = `Test done! Your score is: ${correct}/${questionsToAnswer}`;
    return;
  }

  selMode = document.querySelector('input[name="testMode"]:checked').value;
  questionAndAnswer = makeQuestionAndAnswer(guitarModel, minStr, maxStr, minFr, maxFr, selMode);
  [question, correctAnswer] = questionAndAnswer;
  testPrompt.innerHTML = question;
});

},{"./utils":2}],2:[function(require,module,exports){
function removeWhiteSpace(str) {
  return str.replace(/\s+/g, '');
}

function validateTuning(submittedTuningStr, submittedStringsStr) {
  // tuningRegex matches a sequence of x valid notes, where x is the number of
  // strings on the user's guitar
  const tuningRegex = new RegExp(`^([A-G](b|#)?){${submittedStringsStr}}$`);
  const tuningStr = removeWhiteSpace(submittedTuningStr);

  const valid = tuningRegex.test(tuningStr);

  return valid;
}

function stringToTwoInts(rangeStr, shouldBeRange) {
  const cleanedRange = removeWhiteSpace(rangeStr);
  const rangeRegex = /^\d+,\d+$/;
  const matches = rangeRegex.test(cleanedRange);

  if (!matches) {
    return -1;
  }

  let [min, max] = cleanedRange.split(',');
  [min, max] = [parseInt(min, 10), parseInt(max, 10)];

  if (shouldBeRange && min > max) {
    return -1;
  }

  return [min, max];
}

module.exports = { removeWhiteSpace, validateTuning, stringToTwoInts };
},{}]},{},[1]);
