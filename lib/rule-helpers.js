'use babel';

import { get } from 'request-promise';

const DOCUMENTATION_LIFETIME = 86400 * 1000; // 1 day TODO: Configurable?
const docsRuleCache = new Map();
let docsLastRetrieved;

export function takeWhile(source, predicate) {
  const result = [];
  const { length } = source;
  let i = 0;

  while (i < length && predicate(source[i], i)) {
    result.push(source[i]);
    i += 1;
  }

  return result;
}

// Retrieves style guide documentation with cached responses
export async function getRuleMarkDown(rule) {
  if (new Date().getTime() - docsLastRetrieved < DOCUMENTATION_LIFETIME) {
    // If documentation is stale, clear cache
    docsRuleCache.clear();
  }
  if (docsRuleCache.has(rule)) { return docsRuleCache.get(rule); }

  let rawRulesMarkdown;
  try {
    rawRulesMarkdown = await get(`https://raw.githubusercontent.com/troessner/reek/master/docs/${rule}.md`);
  } catch (x) {
    return '***\nError retrieving documentation';
  }

  const byLine = rawRulesMarkdown.split('\n');
  // eslint-disable-next-line no-confusing-arrow
  const ruleAnchors = byLine.reduce(
    (acc, line, idx) => (line.match(/## Introduction/g) ? acc.concat(idx) : acc),
    [],
  );

  ruleAnchors.forEach((startingIndex) => {
    const beginSearch = byLine.slice(startingIndex + 1);

    // gobble the introduction text until you reach the next section
    const documentationForRule = takeWhile(beginSearch, x => !x.match(/##/));
    const markdownOutput = '***\n'.concat(documentationForRule.join('\n'));

    docsRuleCache.set(rule, markdownOutput);
  });

  docsLastRetrieved = new Date().getTime();
  return docsRuleCache.get(rule);
}
