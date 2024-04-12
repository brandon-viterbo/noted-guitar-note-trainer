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

  if (!validateTuning(newTuning, newStrings)) {
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
  console.log(guitarModel.fretboard);
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

  console.log(`Must answer for question ${questionAndAnswer[0]}, with ${questionAndAnswer[1]}`);
  return questionAndAnswer;
}

function validateRange(rangeStr) {
  const cleanedRange = rangeStr.replace(/\s+/g, '');
  const rangeRegex = /^\d+,\d+$/;
  const matches = rangeRegex.test(cleanedRange);
  let min;
  let max;

  if (matches) {
    [min, max] = cleanedRange.split(',');
  } else {
    return false;
  }

  return parseInt(max, 10) >= parseInt(min, 10);
}

function stringToTwoInts(rangeStr, shouldBeRange) {
  const cleanedRange = rangeStr.replace(/\s+/g, '');
  let min = 0;
  let max = 0;

  if (shouldBeRange) {
    if (!validateRange(rangeStr)) {
      return -1;
    }
  }

  [min, max] = cleanedRange.split(',');

  return [parseInt(min, 10), parseInt(max, 10)];
}

const submitAnswerButton = document.createElement('button');
const answerInput = document.createElement('input');

const testOptions = document.getElementById('testOptions');
const noOfQuestionsElement = document.getElementById('noOfQuestions');
const testPrompt = document.getElementById('testPrompt');
const testInputs = document.getElementById('testInputs');
const rangeOfStrings = document.getElementById('rangeOfStrings');
const rangeOfFrets = document.getElementById('rangeOfFrets');
let rangeStringsTxt;
let rangeFretsTxt;
let minStr;
let maxStr;
let minFr;
let maxFr;
let selMode;
let questionAndAnswer;
let question;
let correctAnswer;
let submittedAnswer;
let isAnswerCorrect;
let questionsToAnswer;
let questionsLeft;
let correct;

submitAnswerButton.type = 'submit';
submitAnswerButton.innerHTML = 'Submit Answer';
submitAnswerButton.value = 'submitAnswer';
answerInput.type = 'text';
answerInput.placeholder = 'Put your answer here!';
testOptions.addEventListener('submit', (e) => {
  e.preventDefault();
  rangeStringsTxt = rangeOfStrings.value;
  rangeFretsTxt = rangeOfFrets.value;

  if (!validateRange(rangeStringsTxt && rangeFretsTxt)) {
    console.log('ERROR: One of the ranges is not in a valid form!');
    return;
  }

  [minStr, maxStr] = stringToTwoInts(rangeStringsTxt, true);
  [minFr, maxFr] = stringToTwoInts(rangeFretsTxt, true);

  if (maxStr > guitarModel.strings || maxFr > guitarModel.frets) {
    console.log('ERROR: String or fret range exceeds that of the guitar!');
    return;
  }

  testInputs.appendChild(submitAnswerButton);
  testInputs.appendChild(answerInput);
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

  let cleanedSubmission = '';
  console.log(`Submitted answer for question ${question}`);
  console.log(guitarModel.fretboard);
  questionsLeft -= 1;

  if (questionsLeft === 0) {
    testPrompt.innerHTML = `Test done! Your score is: ${correct}/${questionsToAnswer}`;
    answerInput.value = '';
    testInputs.removeChild(answerInput);
    testInputs.removeChild(submitAnswerButton);
    return;
  }

  submittedAnswer = answerInput.value;
  answerInput.value = '';

  if (selMode === 'identifyMode') {
    isAnswerCorrect = correctAnswer.includes(submittedAnswer.replace(/\s+/g, ''));
  } else {
    cleanedSubmission = submittedAnswer.replace(/\s+/g, '');
    if (/^\d+,\d+$/.test(cleanedSubmission)) {
      let ansString = '';
      let ansFret = '';
      let toMatch = '';
      [ansString, ansFret] = stringToTwoInts(cleanedSubmission, false);

      const ansStringInRange = (minStr <= ansString && ansString <= maxStr);
      const ansFretInRange = (minFr <= ansFret && ansFret <= maxFr);
      if (!(ansStringInRange || ansFretInRange)) {
        console.log('Answer incorrect, out of range!');
        isAnswerCorrect = false;
      } else {
        toMatch = guitarModel.fretboard[ansString - 1][ansFret];
        console.log(`${correctAnswer} toMatch is ${toMatch}`);
        isAnswerCorrect = correctAnswer[0] === toMatch[0] && correctAnswer[1] === toMatch[1];
      }
    } else {
      console.log('Answer incorrect, bad format')
      isAnswerCorrect = false;
    }
  }

  if (isAnswerCorrect) {
    correct += 1;
    console.log(`Answered correctly with ${submittedAnswer}!`);
  } else {
    console.log(`Answered incorrectly with ${submittedAnswer}!`);
  }

  selMode = document.querySelector('input[name="testMode"]:checked').value;
  questionAndAnswer = makeQuestionAndAnswer(guitarModel, minStr, maxStr, minFr, maxFr, selMode);
  [question, correctAnswer] = questionAndAnswer;
  testPrompt.innerHTML = question;
});
