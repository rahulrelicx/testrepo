const expect = require('chai').expect;
const rewire = require('rewire');
const Element = require('../../../lib/elements/element');

class Event {
  constructor(name) {
    this.name = name;
  }
}

describe('RadioButton', () => {
  let nodes,
    RadioButton,
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
    RadioButton = rewire('../../../lib/elements/radioButton');
    RadioButton.__set__('Event', Event);
    RadioButton.__set__('doActionAwaitingNavigation', async (navigationOptions, action) => {
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
    RadioButton = rewire('../../../lib/elements/radioButton');
    dispatchedEvent = null;
  });

  it('should be element', () => {
    expect(new RadioButton() instanceof Element).to.be.true;
  });
  it('should create radioButton from element', () => {
    const expectedTextBox = RadioButton.from(new Element(12, '', runtimeHandler), 'description');
    const actualTextBox = new RadioButton(12, 'description', runtimeHandler);
    expect(actualTextBox).to.be.deep.equal(expectedTextBox);
  });
  describe('isSelected', () => {
    it('should be selected', async () => {
      const radioButton = new RadioButton(23, 'description', runtimeHandler);
      expect(await radioButton.isSelected()).to.be.true;
    });
    it('should not be selected', async () => {
      const radioButton = new RadioButton(26, 'description', runtimeHandler);
      expect(await radioButton.isSelected()).to.be.false;
    });
  });

  describe('select', () => {
    it('should select an unselected radio button', async () => {
      let objectId = 28;
      const radioButton = new RadioButton(objectId, 'description', runtimeHandler);
      expect(nodes[objectId].checked).to.be.false;

      await radioButton.select();
      expect(nodes[objectId].checked).to.be.true;
      expect(dispatchedEvent instanceof Event).to.be.true;
      expect(dispatchedEvent.name).to.be.equal('click');
    });
    it('should select an selected radio button', async () => {
      let objectId = 30;
      const radioButton = new RadioButton(objectId, 'description', runtimeHandler);
      expect(nodes[objectId].checked).to.be.true;

      await radioButton.select();
      expect(nodes[objectId].checked).to.be.true;
      expect(dispatchedEvent instanceof Event).to.be.true;
      expect(dispatchedEvent.name).to.be.equal('click');
    });
  });

  describe('deselect', () => {
    it('should deselect an unselected radio button', async () => {
      let objectId = 28;
      const radioButton = new RadioButton(28, 'description', runtimeHandler);
      expect(nodes[objectId].checked).to.be.false;

      await radioButton.deselect();
      expect(nodes[objectId].checked).to.be.false;
      expect(dispatchedEvent instanceof Event).to.be.true;
      expect(dispatchedEvent.name).to.be.equal('click');
    });

    it('should deselect an selected radio button', async () => {
      let objectId = 30;
      const radioButton = new RadioButton(objectId, 'description', runtimeHandler);
      expect(nodes[objectId].checked).to.be.true;

      await radioButton.deselect();
      expect(nodes[objectId].checked).to.be.false;
      expect(dispatchedEvent instanceof Event).to.be.true;
      expect(dispatchedEvent.name).to.be.equal('click');
    });
  });
});
