# emitter

Collects listener for an event occurance.

## Installation

Install with `npm i --save @amatiasq/emitter`.

## Usage

```js
import { emitter } from '@amatiasq/emitter';

const onNameChange = emitter<string>();
onNameChange.subscribe(value => console.log(`Received ${value}`));
onNameChange('My new name'); // Received My new name
```

## Usage with channels

```js
import { emitterWithChannels } from '@amatiasq/emitter';

const onNameChange = emitterWithChannels<string, number>();
onNameChange.subscribe('test', value => console.log(`Received ${value}`));
onNameChange('test', 10); // Received 10
onNameChange('foo', 10); // Nothing happens
```
