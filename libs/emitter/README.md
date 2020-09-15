# emitter

Collects listener for an event occurance.

## Installation

Install with `npm i --save @amatiasq/emitter`.

## Usage

```js
import { emitter } from '@amatiasq/emitter';

const onNameChange = emitter<string>();
onNameChange(value => console.log(`Received ${value}`));
onNameChange.emit('My new name'); // Received My new name
```
