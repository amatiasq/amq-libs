#!/bin/bash

libName="$1"
path="libs/$libName"

if [ ! -d "$path" ]
then
  echo "Unknown library '$libName'"
  exit 1
fi

shared="$(pwd)/shared"

cd "$path"

if grep '"prebuild":' package.json > /dev/null
then
  npm run prebuild
fi

npm run build

cp "$shared/tsconfig.es2015.json" .
npm run build -- -P tsconfig.es2015.json
rm tsconfig.es2015.json