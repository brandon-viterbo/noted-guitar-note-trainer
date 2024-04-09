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

  updateGuitar()
})

async function updateGuitar() {
  let currentTuning = document.getElementById("currentTuning"),
    currentStrings = document.getElementById("currentStrings"),
    submittedTuning = document.getElementById("customTuning").value,
    submittedStrings = document.getElementById("submittedStrings").value;

  if (await validateSettings()) {
    currentTuning.innerHTML = submittedTuning;
    currentStrings.innerHTML = submittedStrings;
  } else {
    console.log('Cannot update.')
  }
}

async function validateSettings() {
  let valid = await validateTuning();

  if (valid) {
    console.log('All settings good'); 
  } else {
    console.log('At least one setting is bad');
  }
  
  return valid
}

async function validateTuning() {
  const response = await fetch('./notes.json'),
    notes = await response.text(),
    parsedText = await JSON.parse(notes);

  //console.log(parsedText['notes'][0]);
  //console.log(parsedText['notes'].includes("A"));

  let submittedTuning = document.getElementById("customTuning").value,
    submittedStrings = document.getElementById("submittedStrings").value;

  /*tuningRegex matches a sequence of x valid notes, where x is the number of 
  strings on the user's guitar*/
  let tuningRegex = new RegExp('^([A-G](b|#)?)\{'+submittedStrings+'\}$'),
    tuningStr = submittedTuning.replace(/\s+/g, '');

  let valid = tuningRegex.test(tuningStr);

  if (valid) {
    console.log(tuningStr + ' is a valid tuning')
  } else {
    console.log(tuningStr + ' is an invalid tuning')
  }
  
  return valid;
}
