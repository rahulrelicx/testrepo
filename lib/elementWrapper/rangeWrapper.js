const Range = require('../elements/range');
const ValueWrapper = require('./valueWrapper');
const { firstElement, getElementGetter } = require('./helper');
const { $function } = require('../elementSearch');

function getRangeElementWithLabel(searchElement, label) {
  const fileField = [];
  function checkAndPushElement(elem) {
    if (
      elem.tagName &&
      elem.tagName.toLowerCase() == 'input' &&
      elem.type &&
      elem.type.toLowerCase() === 'range'
    ) {
      fileField.push(elem);
    }
  }
  const matchingLabels = [...searchElement.querySelectorAll('label')].filter((labelElem) => {
    return labelElem.innerText.toLowerCase().includes(label.toLowerCase());
  });
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
  return fileField;
}

/**
 * Behaves the same as ValueWrapper + select(), for {@link Range} element.
 * Represents HTML [Input Range](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range)
 * @extends {ValueWrapper}
 */
class RangeWrapper extends ValueWrapper {
  constructor(attrValuePairs, _options, ...args) {
    super('Range', 'label', attrValuePairs, _options, ...args);
    this._get = getElementGetter(
      this.selector,
      async () => await $function(getRangeElementWithLabel, this.selector.label),
      'input[type="range"]',
    );
  }

  /**
   * Select the given value in the range.
   * @param {number} value accepts float values
   */
  async select(value) {
    const elem = await firstElement.apply(this);
    return await elem.select(value);
  }

  /**
   * Overrides {@link ValueWrapper#elements}, but for Range elements.
   * @param {number} retryInterval Retry Interval in milliseconds (defaults to global settings).
   * @param {number} retryTimeout Retry Timeout in milliseconds (defaults to global settings).
   * @returns {Range[]} Array of all range matching the selector.
   */
  async elements(retryInterval, retryTimeout) {
    let elements = await super.elements(retryInterval, retryTimeout);
    return elements.map((element) => Range.from(element, this._description));
  }
}
module.exports = RangeWrapper;
