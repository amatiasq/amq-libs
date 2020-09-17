#!/usr/bin/env node

const { readdirSync, writeFileSync } = require('fs');

const pkg = require('../package.json');
const { scripts } = pkg;

for (const [key, value] of Array.from(Object.entries(scripts))) {
  if (key.startsWith('build:') || key.startsWith('publish:')) {
    delete scripts[key];
  }
}

for (const lib of readdirSync('./libs')) {
  scripts[`build:${lib}`] = `./scripts/build.sh '${lib}'`;
  scripts[`publish:${lib}`] = `./scripts/publish.sh '${lib}'`;
}

const content = JSON.stringify({ ...pkg, scripts }, null, 2);
writeFileSync('./package.json', content);
