'use babel';

import { get } from 'request-promise';

const DOCUMENTATION_LIFETIME = 86400 * 1000; // 1 day TODO: Configurable?
const docsRuleCache = new Map();

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
  if (docsRuleCache.has(rule)) {
    const cachedRule = docsRuleCache.get(rule);
    if (new Date().getTime() - cachedRule.lasFetched < DOCUMENTATION_LIFETIME) {
      // If documentation is stale, clear cache
      docsRuleCache.delete(rule);
    } else {
      return cachedRule.markdown;
    }
  }

  let rawRulesMarkdown;
  try {
    rawRulesMarkdown = await get(`https://raw.githubusercontent.com/troessner/reek/master/docs/${rule}.md`);
  } catch (x) {
    return '***\nError retrieving documentation';
  }

  const byLine = rawRulesMarkdown.split('\n');
  const ruleAnchors = byLine.reduce(
    (acc, line, idx) => (line.match(/## Introduction/g) ? acc.concat(idx) : acc),
    [],
  );

  ruleAnchors.forEach((startingIndex) => {
    const beginSearch = byLine.slice(startingIndex + 1);

    // gobble the introduction text until you reach the next section
    const documentationForRule = takeWhile(beginSearch, x => !x.match(/##/));
    const markdownOutput = '***\n'.concat(documentationForRule.join('\n'));

    docsRuleCache.set(rule, { markdown: markdownOutput, lasFetched: new Date().getTime() });
  });

  return docsRuleCache.get(rule).markdown;
}
