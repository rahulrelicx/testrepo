const TextBox = require('../elements/textBox');
const ValueWrapper = require('./valueWrapper');
const { $function } = require('../elementSearch');
const { getElementGetter } = require('./helper');

function getTextBoxElementWithLabelOrPlaceholder(searchElement, label) {
  const textBoxes = [];
  const inputTypes = ['text', 'password', 'search', 'number', 'email', 'tel', 'url', undefined];
  function checkAndPushElement(elem) {
    if (
      (elem.tagName && elem.tagName.toLowerCase() === 'textarea') ||
      (elem.getAttribute && elem.getAttribute('contenteditable')) ||
      (elem.tagName &&
        elem.tagName.toLowerCase() == 'input' &&
        elem.type &&
        inputTypes.includes(elem.type.toLowerCase()))
    ) {
      textBoxes.push(elem);
    }
  }
  const matchingLabels = [...searchElement.querySelectorAll('label')].filter((labelElem) => {
    return labelElem.innerText.toLowerCase().includes(label.toLowerCase());
  });

  const matchingPlaceHolders = [...searchElement.querySelectorAll('input[placeholder]')].filter(
    (labelElem) => {
      return labelElem.placeholder.toLowerCase().includes(label.toLowerCase());
    },
  );

  if (matchingLabels.length != 0) {
    for (let matchingLabel of matchingLabels) {
      const labelFor = matchingLabel.getAttribute('for');
      if (labelFor) {
        //check label with attribute for
        const labelForElement = searchElement.getElementById(labelFor);
        checkAndPushElement(labelForElement);
      } else {
        // check child node of label tag
        matchingLabel.childNodes.forEach((elem) => {
          checkAndPushElement(elem);
        });
      }
    }
  }

  if (matchingPlaceHolders.length != 0) {
    for (let matchingPlaceHolder of matchingPlaceHolders) {
      checkAndPushElement(matchingPlaceHolder);
    }
  }
  //check label is inlined
  const inputRadioElements = [
    ...searchElement.querySelectorAll(
      'input[type="text" i],input[type="password" i],input[type="search" i],input[type="number" i],input[type="email" i],input[type="tel" i],input[type="url" i],input:not([type]),textarea,*[contenteditable="true"]',
    ),
  ];
  for (let inputRadioElement of inputRadioElements) {
    if (
      inputRadioElement.nextSibling &&
      inputRadioElement.nextSibling.nodeType === Node.TEXT_NODE &&
      inputRadioElement.nextSibling.wholeText.includes(label)
    ) {
      textBoxes.push(inputRadioElement);
    }
  }
  return textBoxes;
}

/**
 * Behaves the same as ValueWrapper.
 * @extends {ValueWrapper}
 */
class TextBoxWrapper extends ValueWrapper {
  constructor(attrValuePairs, _options, ...args) {
    super('TextBox', 'label', attrValuePairs, _options, ...args);
    this._get = getElementGetter(
      this.selector,
      async () => await $function(getTextBoxElementWithLabelOrPlaceholder, this.selector.label),
      'input[type="text" i],input[type="password" i],input[type="search" i],input[type="number" i],input[type="email" i],input[type="tel" i],input[type="url" i],input:not([type]),textarea,*[contenteditable="true"]',
    );
  }

  /**
   * Overrides {@link ValueWrapper#elements}, but for TextBox elements.
   * @param {number} retryInterval Retry Interval in milliseconds (defaults to global settings).
   * @param {number} retryTimeout Retry Timeout in milliseconds (defaults to global settings).
   * @returns {TextBox[]} Array of all textBoxes matching the selector.
   */
  async elements(retryInterval, retryTimeout) {
    let elements = await super.elements(retryInterval, retryTimeout);
    return elements.map((element) => TextBox.from(element, this._description));
  }
}

module.exports = TextBoxWrapper;
