'use babel';

const DOCUMENTATION_LIFETIME = 86400 * 1000;
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
export async function getRuleMarkDown(rule, ruleLink) {
  if (docsRuleCache.has(rule)) {
    const cachedRule = docsRuleCache.get(rule);
    if (new Date().getTime() >= cachedRule.expires) {
      // If documentation is stale, clear cache
      docsRuleCache.delete(rule);
    } else {
      return cachedRule.markdown;
    }
  }

  let rawRuleMarkdown;
  const response = await fetch(ruleLink.replace('github.com', 'raw.githubusercontent.com').replace('/blob', ''));
  if (response.ok) {
    rawRuleMarkdown = await response.text();
  } else {
    return `***\nError retrieving documentation: ${response.statusText}`;
  }

  const byLine = rawRuleMarkdown.split('\n');
  const ruleAnchors = byLine.reduce(
    (acc, line, idx) => (line.match(/## Introduction/g) ? acc.concat(idx) : acc),
    [],
  );

  ruleAnchors.forEach((startingIndex) => {
    const beginSearch = byLine.slice(startingIndex + 1);

    // gobble the introduction text until you reach the next section
    const documentationForRule = takeWhile(beginSearch, x => !x.match(/##/));
    const markdownOutput = '***\n'.concat(documentationForRule.join('\n'));

    docsRuleCache.set(rule, {
      markdown: markdownOutput,
      expires: new Date().getTime() + DOCUMENTATION_LIFETIME,
    });
  });

  return docsRuleCache.get(rule).markdown;
}
