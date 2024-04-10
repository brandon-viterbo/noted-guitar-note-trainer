window.onload = (event) => { 
  generateNoOfStringsOptions();
}

function generateNoOfStringsOptions (){
  let currentStrings = document.getElementById("currentStrings"),
    min = 4,
    max = 8,
    defaultNo = 6,
    select = document.getElementById('submittedStrings');

  for (var i = min; i<=max; i++){
    var opt = document.createElement('option');
    opt.value = i;
    opt.innerHTML = i;
    if (i === defaultNo) { 
      opt.selected = "selected"; 
      currentStrings.innerHTML = i;
    }
    select.appendChild(opt);
  }
}

let settingsForm = document.getElementById("settingsForm");
settingsForm.addEventListener("submit", (e) => {
  console.log("Update request submitted...")
  e.preventDefault();
  let currentTuningElem = document.getElementById("currentTuning"),
    currentStringsElem = document.getElementById("currentStrings"),
    submittedTuningStr = document.getElementById("customTuning").value,
    submittedStringsStr = document.getElementById("submittedStrings").value;

  updateGuitar(currentTuningElem, currentStringsElem, submittedTuningStr, submittedStringsStr);
})

async function updateGuitar(currentTuningElem, currentStringsElem, submittedTuningStr, submittedStringsStr) {
  if (await validateSettings(submittedTuningStr, submittedStringsStr)) {
    currentTuningElem.innerHTML = submittedTuningStr;
    currentStringsElem.innerHTML = submittedStringsStr;
    console.log('Settings updated.')
  } else {
    console.log('ERROR: Cannot update settings.')
  }
}

async function validateSettings(submittedTuningStr, submittedStringsStr) {
  let valid = await validateTuning(submittedTuningStr, submittedStringsStr);

  if (valid) {
    console.log('All settings are valid.'); 
  } else {
    console.log('ERROR: At least one setting is invalid.');
  }
  
  return valid
}

async function validateTuning(submittedTuningStr, submittedStringsStr) {
  //const response = await fetch('./notes.json'),
  //  notes = await response.text(),
  //  parsedText = await JSON.parse(notes);

  //console.log(parsedText['notes'][0]);
  //console.log(parsedText['notes'].includes("A"));

  //tuningRegex matches a sequence of x valid notes, where x is the number of 
  //strings on the user's guitar
  let tuningRegex = new RegExp('^([A-G](b|#)?)\{'+submittedStringsStr+'\}$'),
    tuningStr = submittedTuningStr.replace(/\s+/g, '');

  let valid = tuningRegex.test(tuningStr);

  if (valid) {
    console.log(tuningStr + ' is a valid tuning')
  } else {
    console.log(tuningStr + ' is an invalid tuning')
  }
  
  return valid;
}
