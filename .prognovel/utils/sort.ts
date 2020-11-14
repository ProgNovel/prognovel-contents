export function sortChapters(a, b) {
  const bookA = a.split("/chapter-")[0];
  const bookB = b.split("/chapter-")[0];
  const isDifferentBook = bookA !== bookB;

  a = convertToNumeric(a, isDifferentBook);
  b = convertToNumeric(b, isDifferentBook);

  if (a[0] === b[0]) {
    return a[1] - b[1];
  }

  return a[0] - b[0];
}

export function convertToNumeric(name, book = false) {
  let splitString = book ? name.split("/chapter-")[0] : name.split("/chapter-")[1];

  if (book) return [0, splitString];
  if (splitString === "prologue") splitString = 0.1;
  splitString = splitString.split("-");
  if (splitString[1] == 0) splitString[1] = 0.5;
  if (splitString[1] === undefined) splitString[1] = 0;
  if (splitString[1] * 0 !== 0) splitString[1] = 99999; // NaN sub-index will be sorted as non-numeric

  let result;
  try {
    result = splitString.map((ch) => JSON.parse(ch));
  } catch (error) {
    console.log("Error when parsing", splitString[1]);
  }

  return result;
}
