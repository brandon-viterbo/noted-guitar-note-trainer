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