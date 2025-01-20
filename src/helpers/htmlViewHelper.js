function tabToSpaces(text) {
  if (!text) return;
  return text.replace(/(\t)/gm, '\u0020\u0020');
}

function squeezeSpaces(text) {
  if (!text) return;
  return text.replace(/  +/g, ' ');
}

function removeSpacesAroundTags(text) {
  if (!text) return;
  // remove whitespaces after opening and self-closing tags
  let pattern = /(<[\w+\s*\w*]+[=*"*\w*"\s*]*[/]*>)\s+/;
  let regexp = new RegExp(pattern, 'gm');
  text = text.replace(regexp, '$1');
  // remove whitespaces before closing tags
  pattern = /\s+(<\/\w+)/;
  regexp = new RegExp(pattern, 'gm');
  text = text.replace(regexp, '$1');
  // remove whitespaces between tags
  pattern = /(>\s+<)/;
  regexp = new RegExp(pattern, 'gm');
  return text.replace(regexp, '><');
}

// remove <br /> between </li> and <li>or </ul> because it is not valid
// before: </li><br /><li> or </li><br /><ul>
// after: </li><li> or </li></ul>
function removeBrInLists(text) {
  if (!text) return;
  let pattern = '</li> *<br */?> *<li>';
  let regexp = new RegExp(pattern, 'gm');
  text = text.replace(regexp, '</li><li>');
  pattern = '</li> *<br */?> *</ul>';
  regexp = new RegExp(pattern, 'gm');
  return text.replace(regexp, '</li></ul><br />');
}

function beforeAction(text) {
  text = tabToSpaces(text);
  text = removeSpacesAroundTags(text);
  return squeezeSpaces(text);
}

function afterAction(text) {
  return removeBrInLists(text);
}

export function trimNewLines(text) {
  if (!text) return;
  text = beforeAction(text).replace(/(\r\n|\n|\r)/gm, '');
  return afterAction(text);
}

export function spaceNewLines(text) {
  if (!text) return;
  text = beforeAction(text).replace(/(\r\n|\n|\r)/gm, ' ');
  return afterAction(text);
}

export function containsHtml(text) {
  if (!text) return false;
  const pattern = /<\/?[a-z][\s\S]*>/; // thx to: https://stackoverflow.com/a/15458987
  const regexp = new RegExp(pattern, 'gm');
  return regexp.test(text);
}

export function removeHtml(text) {
  if (!text) return;
  const pattern = /<[^>]*>/g;
  return trimNewLines(text.replace(pattern, ''));
}
