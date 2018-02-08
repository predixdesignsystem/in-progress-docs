const fs = require('fs');
const {resolve} = require('path');

const isDirectory = source =>
  fs.lstatSync(source).isDirectory();

const getDirectories = source =>
  fs.readdirSync(source).map(name => resolve(source, name)).filter(isDirectory);

const sortTags = (a, b) => {
  // Convert any 'v0.2' -> 'v0.2.0' so they are valid semver tags. :(
  const badPreTag = /^v0\.[0-9]+$/;
  const _a = badPreTag.test(a) ? `${a}.0` : a;
  const _b = badPreTag.test(b) ? `${b}.0` : b;
  return rcompare(_a, _b);
};

const getTags = repo => getDirectories(resolve(__dirname, `../${repo}`))
  .map(r => r.split('/').pop())
  .filter(r => r[0] === 'v')
  .sort(sortTags);

const repos = getDirectories(resolve(__dirname, '../'))
  .map(r => r.split('/').pop())
  .filter(r => r.slice(0,3) === 'px-');

const printRepoLink = (repo, tag) =>
  `<li><a href="${repo}/${tag}/${repo}">${tag}</a></li>`;

const printRepoBlock = (repo, tags) => `
<h2>${repo}</h2>
<ul>
${tags.length ? tags.map(t => printRepoLink(repo, t)).join('\n') : '<li>no tags found</li>'}
</ul>
`.trim();

const index = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Docs</title>
</head>
<body>
${repos.map(r => printRepoBlock(r, getTags(r))).join('\n')}
</body>
</html>
`.trim();

fs.writeFileSync(resolve(__dirname, '../index.html'), index);
