const { setNavigationOptions } = require('../config');
const { descEvent } = require('../eventBus');
const Element = require('./element');
const { defaultConfig } = require('../config');
const { highlightElement } = require('./elementHelper');
const { doActionAwaitingNavigation } = require('../doActionAwaitingNavigation');

class RadioButton extends Element {
  async isSelected() {
    function getvalue() {
      return this.checked;
    }
    const options = { objectId: this.get() };
    const { result } = await this.runtimeHandler.runtimeCallFunctionOn(getvalue, null, options);
    var description = result.value
      ? this.description + 'is selected.'
      : this.description + 'is not selected.';
    descEvent.emit('success', description);
    return result.value;
  }
  async select() {
    const navigationOptions = setNavigationOptions({});
    await doActionAwaitingNavigation(navigationOptions, async () => {
      const objectId = this.get();
      if (defaultConfig.headful) {
        await highlightElement(this);
      }
      const options = { objectId: objectId, arg: true };
      await this.runtimeHandler.runtimeCallFunctionOn(setChecked, null, options);
      descEvent.emit('success', this.description + 'is checked');
    });
  }
  async deselect() {
    const navigationOptions = setNavigationOptions({});
    await doActionAwaitingNavigation(navigationOptions, async () => {
      const objectId = this.get();
      if (defaultConfig.headful) {
        await highlightElement(this);
      }
      const options = { objectId: objectId, arg: false };
      await this.runtimeHandler.runtimeCallFunctionOn(setChecked, null, options);
      descEvent.emit('success', this.description + 'is unchecked');
    });
  }

  static from(element, description) {
    return new RadioButton(element.get(), description, element.runtimeHandler);
  }
}

function setChecked(value) {
  this.checked = value;
  ['change', 'input', 'click'].forEach((ev) => {
    let event = new Event(ev, { bubbles: true });
    try {
      this.dispatchEvent(event);
    } catch (e) {
      return {
        error: `Error occurred while dispatching ${ev} event`,
        stack: e.stack,
      };
    }
  });
}

module.exports = RadioButton;
