const utils = require('./utils');

test.each([['1, 2', '1,2'], ['1, 2 ', '1,2'], ['     1, 2', '1,2']])(
  '"%s" with white space removed is "%s".',
  (str, expected) => {
    expect(utils.removeWhiteSpace(str)).toBe(expected);
  },
);

test.each([['EADGBE', 6, true], ['EADGBE   ', 6, true], ['EADGBE', 7, false], ['EADGBE', 5, false]])(
  '%s tuning with %i strings is %s.',
  (tuning, strings, expected) => {
    expect(utils.validateTuning(tuning, strings, expected)).toBe(expected);
  },
);

test.each([['1,2', true, [1, 2]], ['1,2', false, [1, 2]], ['4,3', true, -1], ['4,3', false, [4, 3]], 
  ['4', true, -1], ['4', false, -1], ['1,2,3', true, -1], ['1,2,3', true, -1]])(
  '%s input where isRange(%s) is %s.',
  (input, isRange, expected) => {
    expect(utils.stringToTwoInts(input, isRange, expected)).toStrictEqual(expected);
  },
);