# Scheduler

A smarter timer.

## Installation

Install with `npm i --save @amatiasq/scheduler`.

## Usage

```js
import { Scheduler } from '@amatiasq/scheduler';

// for test purposes
function sleep(milliseconds: number) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

const halfSecond = 500;
const oneSecond = 1000;
const twoSeconds = 2000;
const scheduler = new Scheduler(oneSecond, () => console.log('TESTING'));

// nothing will happen until we call `start()` or `restart()`
await sleep(twoSeconds);

scheduler.start(); // start countdown

// If we keep restarting we keep delaying the execution
await sleep(halfSecond);
scheduler.restart(); // restart countdown from 0
await sleep(halfSecond);
scheduler.restart(); // restart countdown from 0

await sleep(oneSecond);
// prints "TESTING"

// we can restart as many times as we want
scheduler.start();
await sleep(halfSecond);

// if we stop it will never be executed until we call `start()` again
scheduler.stop();
await sleep(oneSecond);
// nothing prints
```
