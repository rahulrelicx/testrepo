const expect = require('chai').expect;
let {
  openBrowser,
  closeBrowser,
  goto,
  screenshot,
  setConfig,
  above,
  text,
  $,
} = require('../../lib/taiko');
let { createHtml, removeFile, openBrowserArgs, resetConfig } = require('./test-util');
let path = require('path');
let fs = require('fs');
const test_name = 'screenshot';

describe(test_name, () => {
  let filePath;
  let screenshotPath = path.join(__dirname, 'data', 'screenshot.png');
  before(async () => {
    let innerHtml = `
        <div class="example">
            <h3 id='header'>Screenshot</h3>
            <p>Sample webpage for screenshot</p>
        </div>`;
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
    removeFile(screenshotPath);
  });

  describe('screenshot', () => {
    it('should get the screenshot in given path', async () => {
      await screenshot({ path: screenshotPath });
      expect(fs.existsSync(screenshotPath)).to.be.true;
    });
    it('should get the screenshot with encoding', async () => {
      expect(await screenshot({ encoding: 'base64' })).to.not.be.empty;
    });
    it('should get the screenshot with proximity selectors', async () => {
      let screenshotPath = path.join(__dirname, 'data', 'screenshot_proximity.png');
      await screenshot(text('Screenshot', above('Sample webpage for screenshot')), {
        path: screenshotPath,
      });
      expect(fs.existsSync(screenshotPath)).to.be.true;
      removeFile(screenshotPath);
    });

    it('should get the screenshot with elements', async () => {
      let screenshotPath = path.join(__dirname, 'data', 'screenshot_proximity.png');
      await screenshot(await $('#header').element(0), {
        path: screenshotPath,
      });
      expect(fs.existsSync(screenshotPath)).to.be.true;
      removeFile(screenshotPath);
    });
  });
});
