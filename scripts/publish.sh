#!/bin/bash -e

libName="$1"
path="libs/$libName"

if [ ! -d "$path" ]
then
  echo "Unknown library '$libName' [--access=public]"
  exit 1
fi

./scripts/build.sh "$libName"

cp ./shared/.npmignore "$path"

echo "$path"
cd "$path"

echo "Publishing..."
if [ -z "$2" ]
then
  npm publish
else
  npm publish "$2"
fi

rm .npmignore
rm -r dist dist.es2015
