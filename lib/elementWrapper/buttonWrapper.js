const { $function, match } = require('../elementSearch');
const ElementWrapper = require('./elementWrapper');
const { getElementGetter } = require('./helper');

function getButtonElementWithLabel(searchElement, label) {
  const buttons = [];
  const inputTypes = ['button', 'submit', 'reset', 'image'];
  function checkAndPushElement(elem) {
    if (
      (elem.tagName && elem.tagName.toLowerCase() === 'button') ||
      (elem.tagName &&
        elem.tagName.toLowerCase() == 'input' &&
        elem.type &&
        inputTypes.includes(elem.type.toLowerCase()))
    ) {
      buttons.push(elem);
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
  // check inputs matching types and value
  const matchingValues = searchElement.querySelectorAll(
    `input[type="submit"][value*="${label}"],input[type="image"][value*="${label}"],input[type="reset"][value*="${label}"],input[type="button"][value*="${label}"]`,
  );
  return buttons.concat([...matchingValues]);
}

/**
 * Behaves the same as ElementWrapper, but for HTML Button (including `input` and `button` tags) element.
 * Supported HTML tags:
 * - [`input[type="submit" i]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/submit)
 * - [`input[type="image" i]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/image)
 * - [`input[type="reset" i]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/reset)
 * - [`input[type="button" i]`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/button)
 * - [`button`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button)
 * @extends {ElementWrapper}
 */
class ButtonWrapper extends ElementWrapper {
  constructor(attrValuePairs, _options, ...args) {
    super('Button', 'label', attrValuePairs, _options, ...args);
    this.getByButton = getElementGetter(
      this.selector,
      async () => match(this.selector.label, this._options).elements('button', 0, 0),
      'button',
    );

    this.getByInput = getElementGetter(
      this.selector,
      async () => await $function(getButtonElementWithLabel, this.selector.label),
      'input[type="submit"],input[type="reset"],input[type="button"],input[type="image"]',
    );
    this._get = async () => {
      const input = await this.getByInput();
      if (input.length) {
        return input;
      }
      return this.getByButton();
    };
  }
}
module.exports = ButtonWrapper;
