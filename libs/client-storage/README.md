# Client Storage

This library manages `localStorage`.

## Installation

Install with `npm i --save @amatiasq/client-storage`.

## Usage

```js
import { ClientStorage } from '@amatiasq/client-storage';

const options = {
  // use sessionStorage instead of localStorage. Default false
  isSessionOnly = true,
  // disables cache, access localStorage on every request. Default false
  noCache = true,
  // keeps tracks of version changes see [versioning](#versioning). Default 0
  version = 3,
};

const lang = new ClientStorage<string>('my-app-language', options);

console.log(lang.get()); // null on first run

lang.set('en');
console.log(lang.get()); // 'en'

const stored = lang.clear();
console.log(stored); // 'en';
console.log(lang.get()) // null
```

## Complex objects

This can easily manage any kind of object. Serialization / deserialization is managed by `JSON.stringify` / `JSON.parse`.

## Versioning

This class will store a `version` number next to the stored value. If the stored version number does not match the current one, it will remove the stored value. This prevents an updated application to receive legacy formats and removes the need to ask the clients to wipe site data.

```js
import { ClientStorage } from '@amatiasq/client-storage';

const first = new ClientStorage() < string > ('test', { version: 0 });
first.set('this is a test');
console.log(first.get()); // 'this is a test'

const second = new ClientStorage() < string > ('test', { version: 1 });
console.log(second.get()); // null

console.log(first.get()); // null
```
