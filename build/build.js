const {exec} = require('child_process');
const {resolve} = require('path');
const {rcompare} = require('semver');
const [,,repo] = process.argv;

/* Need an exec with a higher stderr/stdout size */
const execXL = (command, cb) => {
  // Sets max buffer to 800KB (default is 200KB)
  exec(command, {maxBuffer: 1024 * 800}, (err, stdout, stderr) => {
    callback(err, stdout, stderr);
  });
};

const repoPath = resolve(__dirname, repo);

const getTags = () => new Promise((resolve, reject) => {
  exec(`git --git-dir=${repoPath}/.git tag`, (err, stdout) => {
    if (err) reject(err);
    const tags = stdout.split('\n').filter(t => t !== "");
    resolve(tags);
  });
});

const buildTag = tag => new Promise((resolve, reject) => {
  const command = [
    `cd ${repoPath}`,
    `git checkout ${tag}`,
    `bower install`,
    `polymer build`,
    `mv build/default build/${repo}`,
    `mv bower_components/* build`,
    `mv ${repo}-api.json build`,
    `echo "<META http-equiv=refresh content='0;URL=${repo}'>" > build/index.html`,
    `mv build ${tag}`,
    `rm -rf ../../${repo}/${tag}`,
    `mv ${tag} ../../${repo}/`,
    `git reset master --hard`,
  ].join(' && ');
  execXL(command, (err, stdout) => {
    if (err) reject(err);
    resolve();
  });
});

const cleanTags = tags => {
  // Must be an array
  const _tags = Array.isArray(tags) ? [...tags] : [];
  // Sort from newest to oldest
  _tags.sort(sortTags);
  // Only return the last 5
  return _tags.slice(0,5);
}

const sortTags = (a, b) => {
  // Convert any 'v0.2' -> 'v0.2.0' so they are valid semver tags. :(
  const badPreTag = /^v0\.[0-9]+$/;
  const _a = badPreTag.test(a) ? `${a}.0` : a;
  const _b = badPreTag.test(b) ? `${b}.0` : b;
  return rcompare(_a, _b);
}

(async () => {
  console.log(`${repo}:`)
  let tags = await getTags();
  const _tags = cleanTags(tags);
  console.log(`..Found tags: ${_tags.length ? _tags.join(', ') : 'none'}`);
  for (let tag of _tags) {
    let start = Date.now();
    console.log(`...Building ${tag}`);
    await buildTag(tag);
    console.log(`....(done in ${(Date.now()-start)/1000}s)`)
  }
})();
