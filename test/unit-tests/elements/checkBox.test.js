const expect = require('chai').expect;
const rewire = require('rewire');
const Element = require('../../../lib/elements/element');

class Event {
  constructor(name) {
    this.name = name;
  }
}

describe('CheckBox', () => {
  let nodes,
    CheckBox,
    dispatchedEvent = null,
    runtimeHandler = {
      async runtimeCallFunctionOn(predicate, contextId, options) {
        return {
          result: {
            value: predicate.call(nodes[options.objectId], options.arg),
          },
        };
      },
    };

  beforeEach(() => {
    CheckBox = rewire('../../../lib/elements/checkBox');
    CheckBox.__set__('Event', Event);
    CheckBox.__set__('doActionAwaitingNavigation', async (navigationOptions, action) => {
      await action();
    });
    nodes = {
      23: {
        checked: true,
      },
      26: {
        checked: false,
      },
      28: {
        checked: false,
        dispatchEvent(event) {
          dispatchedEvent = event;
        },
      },
      30: {
        checked: true,
        dispatchEvent(event) {
          dispatchedEvent = event;
        },
      },
    };
  });
  afterEach(() => {
    CheckBox = rewire('../../../lib/elements/checkBox');
    dispatchedEvent = null;
  });

  it('should be element', () => {
    expect(new CheckBox() instanceof Element).to.be.true;
  });
  it('should create CheckBox from element', () => {
    const expectedCheckBox = CheckBox.from(new Element(12, '', runtimeHandler), 'description');
    const actualCheckBox = new CheckBox(12, 'description', runtimeHandler);
    expect(actualCheckBox).to.be.deep.equal(expectedCheckBox);
  });
  describe('isChecked', () => {
    it('should be checked', async () => {
      const checkBox = new CheckBox(23, 'description', runtimeHandler);
      expect(await checkBox.isChecked()).to.be.true;
    });
    it('should not be checked', async () => {
      const checkBox = new CheckBox(26, 'description', runtimeHandler);
      expect(await checkBox.isChecked()).to.be.false;
    });
  });

  describe('check', () => {
    it('should check an uncheckedd checkbox', async () => {
      let objectId = 28;
      const checkBox = new CheckBox(objectId, 'description', runtimeHandler);
      expect(nodes[objectId].checked).to.be.false;

      await checkBox.check();
      expect(nodes[objectId].checked).to.be.true;
      expect(dispatchedEvent instanceof Event).to.be.true;
      expect(dispatchedEvent.name).to.be.equal('click');
    });
    it('should check a checked checkbox', async () => {
      let objectId = 30;
      const checkBox = new CheckBox(objectId, 'description', runtimeHandler);
      expect(nodes[objectId].checked).to.be.true;

      await checkBox.check();
      expect(nodes[objectId].checked).to.be.true;
      expect(dispatchedEvent instanceof Event).to.be.true;
      expect(dispatchedEvent.name).to.be.equal('click');
    });
  });

  describe('uncheck', () => {
    it('should uncheck an unchecked checkbox', async () => {
      let objectId = 28;
      const checkBox = new CheckBox(28, 'description', runtimeHandler);
      expect(nodes[objectId].checked).to.be.false;

      await checkBox.uncheck();
      expect(nodes[objectId].checked).to.be.false;
      expect(dispatchedEvent instanceof Event).to.be.true;
      expect(dispatchedEvent.name).to.be.equal('click');
    });

    it('should uncheck a checked checkbox', async () => {
      let objectId = 30;
      const checkBox = new CheckBox(objectId, 'description', runtimeHandler);
      expect(nodes[objectId].checked).to.be.true;

      await checkBox.uncheck();
      expect(nodes[objectId].checked).to.be.false;
      expect(dispatchedEvent instanceof Event).to.be.true;
      expect(dispatchedEvent.name).to.be.equal('click');
    });
  });
});
