const chai = require('chai');
const path = require('path');
const rewire = require('rewire');
const expect = chai.expect;
const test_name = 'util';

describe(test_name, () => {
  let util, trimCharLeft, escapeHtml, taikoInstallationLocation;
  before(() => {
    util = rewire('../../lib/util');
    trimCharLeft = util.trimCharLeft;
    escapeHtml = util.escapeHtml;
    taikoInstallationLocation = util.taikoInstallationLocation;
  });
  after(() => {
    util = rewire('../../lib/util');
  });
  describe('trim Char()', () => {
    it('should trim the char specified from the string', async () => {
      const actual = trimCharLeft('|foo', '|');
      const expected = 'foo';
      expect(actual).to.be.equal(expected);
    });
    it('should return empty string for null or undefined', async () => {
      expect(trimCharLeft(null, '|')).to.be.equal('');
      expect(trimCharLeft(undefined, '|')).to.be.equal('');
    });
  });

  describe('.escapeHtml', () => {
    it('should escape special char for html', async () => {
      const actual = escapeHtml('&');
      const expected = '&amp;';
      expect(actual).to.be.equal(expected);
    });

    it('should escape multiple special char for html', async () => {
      const actual = escapeHtml('& foo \' " ;');
      const expected = '&amp; foo &#039; &quot; ;';
      expect(actual).to.be.equal(expected);
    });
  });

  describe('taikoInstallationLocation', () => {
    let packageJSONExists = true,
      packageJSONData,
      globalPath,
      localPath;
    before(() => {
      globalPath = path.join('path', 'to', 'taiko-global', 'installation');
      localPath = path.join('path', 'to', 'taiko-local', 'installation');
      util.__set__('existsSync', () => {
        return packageJSONExists;
      });
      util.__set__('readFileSync', () => {
        return packageJSONData;
      });
      util.__set__('spawnSync', (_, options) => {
        if (options.includes('-g')) {
          return { output: [null, globalPath] };
        }
        return { output: [null, localPath] };
      });
    });

    it('should return taiko installtion location when CWD is not an npm project', () => {
      packageJSONExists = false;
      let expected = path.join(globalPath, 'taiko');
      let actual = taikoInstallationLocation();
      expect(actual).to.be.equal(expected);
    });

    it('should return taiko installtion location when taiko is installed locally', () => {
      packageJSONExists = true;
      packageJSONData = JSON.stringify({
        dependencies: {
          taiko: '1.0.3',
        },
      });
      let expected = path.join(localPath, 'taiko');
      let actual = taikoInstallationLocation();
      expect(actual).to.be.equal(expected);
    });

    it('should return taiko installtion location when taiko is installed globally', () => {
      packageJSONExists = true;
      packageJSONData = JSON.stringify({ name: 'npm-module' });
      let expected = path.join(globalPath, 'taiko');
      let actual = taikoInstallationLocation();
      expect(actual).to.be.equal(expected);
    });

    it('should return taiko installtion location when taiko is installed from local source', () => {
      packageJSONExists = true;
      packageJSONData = JSON.stringify({ name: 'taiko' });
      let expected = process.cwd();
      let actual = taikoInstallationLocation();
      expect(actual).to.be.equal(expected);
    });
  });
});
