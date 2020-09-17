#!/bin/bash

libName="$1"
path="libs/$libName"

if [ ! -d "$path" ]
then
  echo "Unknown library '$libName'"
  exit 1
fi

./scripts/build.sh "$libName"

cp shared/.npmignore "$path"

cd "$path"
npm publish

rm .npmignore