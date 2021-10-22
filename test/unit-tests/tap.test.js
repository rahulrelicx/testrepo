const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
let {
  openBrowser,
  tap,
  closeBrowser,
  goto,
  text,
  button,
  below,
  setConfig,
  accept,
  alert,
} = require('../../lib/taiko');
let { createHtml, removeFile, openBrowserArgs, resetConfig } = require('./test-util');
const test_name = 'tap';

describe(test_name, () => {
  let filePath;
  before(async () => {
    let innerHtml = `
            <span>tap with proximity</span>
            <div>
                <span onclick="displayText('tap works with text nodes.')">tap on text node</span>
                <span>tap with proximity</span>
            </div>
            <div>
                <input type="checkbox" onclick="displayText('tap works with ghost element covering text.')"
                   style="
                        opacity:0.01;
                        width:400px;
                        height:20px;
                        position: absolute
                   "
                   />
                <span class='b'>tap ghost element covering text.</span>
            </div>
            </div>
            <span>Proximity marker</span>
            <input onclick="displayText('tap works with text as value.')" value="Text as value"/><br/>
            <input onclick="displayText('tap works with text as type.')" type="Text as type"/><br/>
            <span onclick="displayText('tap works with proximity selector.')">tap with proximity</span>
            <div onclick="displayText('tap works with text accross element.')">
                Text <span>accross</span> elements
            </div>
            <script type="text/javascript">
                function displayText(text) {
                    document.getElementById('root').innerText = text
                }
            </script>
            <div style="height:1500px"></div>
            <div id="root" style="background:red;"></div>
            <span onclick="displayText('tap works with auto scroll.')">Show Message</span>
            <style>
                .overlayContainer{
                  position:relative;
                }
                .overlay {
                  position: absolute;
                  top:0;
                  left:0;
                  width:100%;
                  height:100%;
                  text-align:center;
                }
            </style>
            <div class="overlayContainer">
                <div class='a'>tap Element covered</div>
                <span class='overlay'></span>
            </div>
            <button type="button" disabled>tap Me!</button>
            <script>
    class ShadowButton extends HTMLElement {
      constructor() {
        super();
        var shadow = this.attachShadow({mode: 'open'});

        var button = document.createElement('input');
        button.setAttribute('type', 'button');
        button.setAttribute('value', 'Shadow tap');
        button.addEventListener("tap", event => {
          alert("Hello from the shadows");
        });
        shadow.appendChild(button);
        
      }
    }
    customElements.define('shadow-button', ShadowButton);
  </script>
  <shadow-button>
            `;
    filePath = createHtml(innerHtml, test_name);
    await openBrowser(openBrowserArgs);
    await goto(filePath);
    setConfig({
      waitForNavigation: false,
      retryTimeout: 10,
      retryInterval: 10,
    });
  });

  after(async () => {
    resetConfig();
    await closeBrowser();
    removeFile(filePath);
  });

  describe('scroll to tap', () => {
    it('test if auto scrolls to element before taping', async () => {
      await tap('Show Message');
      expect(await text('tap works with auto scroll.').exists()).to.be.true;
    });
  });

  describe('With text nodes', () => {
    it('should tap', async () => {
      await tap('on text');
      expect(await text('tap works with text nodes.').exists()).to.be.true;
    });
  });

  describe('element inside shadow dom', () => {
    it('should tap', async () => {
      alert('Hello from the shadows', async () => {
        await accept();
      });
      await tap(button('Shadow tap'));
    });
  });

  describe('With proximity selector', () => {
    it('should tap', async () => {
      await tap('tap with proximity', below('Proximity marker'));
      expect(await text('tap works with proximity selector.').exists()).to.be.true;
    });
  });

  describe('Text accross element', () => {
    it('should tap', async () => {
      await tap('Text accross elements');
      expect(await text('tap works with text accross element.').exists()).to.be.true;
    });
  });

  describe('Text as value', () => {
    it('should tap', async () => {
      await tap('Text as value');
      expect(await text('tap works with text as value.').exists()).to.be.true;
    });
  });

  describe('With ghost element', () => {
    it('should tap the ghost element', async () => {
      await tap('tap ghost element covering text');
      expect(await text('tap works with ghost element covering text.').exists()).to.be.true;
    });

    describe('With element covered by an overlay', () => {
      it('should throw error', async () => {
        await expect(tap('tap Element covered')).to.be.rejectedWith(
          'Element matching text "tap Element covered" is covered by other element',
        );
      });
    });
  });
});
