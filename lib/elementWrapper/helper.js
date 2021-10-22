const { isString, isElement, isSelector, isRegex, waitUntil } = require('../helper');
const { RelativeSearchElement, handleRelativeSearch } = require('../proximityElementSearch');
const { $$ } = require('../elementSearch');

const firstElement = async function (retryInterval, retryTimeout) {
  let elems = await this.elements(retryInterval, retryTimeout);
  if (elems.length < 1) {
    throw new Error(`${this.description} not found`);
  }
  let actionableElement;
  await waitUntil(
    async () => {
      elems = await this.elements(retryInterval, retryTimeout);
      for (let elem of elems) {
        try {
          let actionable = await elem.isVisible();
          if (!actionable) {
            continue;
          }
          actionableElement = elem;
          return true;
        } catch (e) {
          if (e.message.match(/Browser process with pid \d+ exited with/)) {
            throw e;
          }
        }
      }
      return false;
    },
    retryInterval,
    retryTimeout,
  ).catch(() => {});
  return actionableElement ? actionableElement : elems[0];
};

const prepareParameters = (attrValuePairs, options, ...args) => {
  if (options instanceof RelativeSearchElement) {
    args = [options].concat(args);
    options = {};
  }
  let values = {
    selector: { attrValuePairs: attrValuePairs, args: args },
  };
  if (attrValuePairs instanceof RelativeSearchElement) {
    args = [attrValuePairs].concat(args);
    values.selector = { args: args };
  } else if (
    isString(attrValuePairs) ||
    isSelector(attrValuePairs) ||
    isElement(attrValuePairs) ||
    isRegex(attrValuePairs)
  ) {
    values.selector = { label: attrValuePairs, args: args };
  }
  values.options = options || {};
  return values;
};

const getQuery = (attrValuePairs, tag = '') => {
  let path = tag;
  for (const key in attrValuePairs) {
    if (key === 'class') {
      path += `[${key}*="${attrValuePairs[key]}"]`;
    } else {
      path += `[${key}="${attrValuePairs[key]}"]`;
    }
  }
  return path;
};

const getElementGetter = (selector, query, tags) => {
  let get;
  if (selector.attrValuePairs) {
    let query = tags
      .split(',')
      .map((tag) => getQuery(selector.attrValuePairs, tag))
      .join(',');
    get = async () => await handleRelativeSearch(await $$(query), selector.args);
  } else if (selector.label) {
    get = async () => await handleRelativeSearch(await query(), selector.args);
  } else {
    get = async () => await handleRelativeSearch(await $$(tags), selector.args);
  }
  return get;
};

const desc = (selector, query, tag, options) => {
  let description = '';
  if (selector.attrValuePairs) {
    description = getQuery(selector.attrValuePairs, tag);
  } else if (selector.label) {
    description = `${tag} with ${query} ${selector.label} `;
  } else if (options.row && options.col) {
    description = `${tag} with ${query}`;
  }

  for (const arg of selector.args) {
    description += description === '' ? tag : ' and';
    description += ' ' + arg.toString();
  }

  return description;
};

function elementTypeToSelectorName(elementType) {
  const elementTypeMap = {
    CustomSelector: '$',
    Table: 'tableCell',
    Element: 'text',
  };
  return elementType in elementTypeMap
    ? elementTypeMap[elementType]
    : elementType.charAt(0).toLowerCase() + elementType.slice(1);
}

module.exports = {
  prepareParameters,
  getElementGetter,
  desc,
  firstElement,
  elementTypeToSelectorName,
};
