#!/bin/bash

name="$1"
pascal="$2"

if [ -z "$name" ]
then
  echo "Usage $0 <library name> <PascalName"
  exit 1
fi

if [ -z "$pascal" ]
then
  pascal="$name"
fi

path="libs/$name"

mkdir "$path"

cat ./template/package.json \
  | sed "s/libraryname/$name/" \
  | sed "s/PascalCase/$pascal/" \
  > "$path/package.json"

cp ./template/tsconfig.json "$path"
touch "$path/$pascal.ts"

echo "# $pascal

Short description

## Installation

Install with \`npm i --save @amatiasq/$name\`.

## Usage

\`\`\`js
import { $pascal } from '@amatiasq/$name';" > "$path/README.md"

cat "libs/$name/package.json"

./scripts/update-package-json.js
