function generateNoOfStringsOptions() {
  const currentStrings = document.getElementById('currentStrings');
  const min = 4;
  const max = 8;
  const defaultNo = 6;
  const select = document.getElementById('submittedStrings');
  let i;

  for (i = min; i <= max; i += 1) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    if (i === defaultNo) {
      opt.selected = 'selected';
      currentStrings.innerHTML = i;
    }
    select.appendChild(opt);
  }
}

window.onload = () => {
  generateNoOfStringsOptions();
};

async function validateTuning(submittedTuningStr, submittedStringsStr) {
  /* const response = await fetch('./notes.json'),
    notes = await response.text(),
    parsedText = await JSON.parse(notes);

  console.log(parsedText['notes'][0]);
  console.log(parsedText['notes'].includes("A")); */

  // tuningRegex matches a sequence of x valid notes, where x is the number of
  // strings on the user's guitar
  // const tuningRegex = new RegExp('^([A-G](b|#)?)\{'+submittedStringsStr+'\}$');
  const tuningRegex = new RegExp(`^([A-G](b|#)?){${submittedStringsStr}}$`);
  const tuningStr = submittedTuningStr.replace(/\s + /g, '');

  const valid = tuningRegex.test(tuningStr);

  if (valid) {
    console.log(`${tuningStr} is a valid tuning`);
  } else {
    console.log(`${tuningStr} is an valid tuning`);
  }

  return valid;
}

async function validateSettings(submittedTuningStr, submittedStringsStr) {
  const valid = await validateTuning(submittedTuningStr, submittedStringsStr);

  if (valid) {
    console.log('All settings are valid.');
  } else {
    console.log('ERROR: At least one setting is invalid.');
  }

  return valid;
}

async function updateGuitar(currTuningElem, currStringsElem, submitTuningStr, submitStringsStr) {
  const updatedTuning = currTuningElem;
  const updatedStrings = currStringsElem;

  if (await validateSettings(submitTuningStr, submitStringsStr)) {
    updatedTuning.innerHTML = submitTuningStr;
    updatedStrings.innerHTML = submitStringsStr;
    console.log('Settings updated.');
  } else {
    console.log('ERROR: Cannot update settings.');
  }
}

const settingsForm = document.getElementById('settingsForm');
settingsForm.addEventListener('submit', (e) => {
  console.log('Update request submitted...');
  e.preventDefault();
  const currentTuningElem = document.getElementById('currentTuning');
  const currentStringsElem = document.getElementById('currentStrings');
  const submittedTuningStr = document.getElementById('customTuning').value;
  const submittedStringsStr = document.getElementById('submittedStrings').value;

  updateGuitar(currentTuningElem, currentStringsElem, submittedTuningStr, submittedStringsStr);
});
