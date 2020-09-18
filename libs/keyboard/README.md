# KeyboardController

Simple class to track keyboard pressed keys.

## Installation

Install with `npm i --save @amatiasq/keyboard`.

## Usage

```js
import { KeyboardController, KeyCode } from '@amatiasq/keyboard';

enum Actions {
  RUN,
  JUMP,
  SHOOT,
}

const keyboard = new KeyboardController<Actions>();

keyboard.setKeyMap(KeyCode.ArrowRight, Actions.RUN);
keyboard.setKeyMap(KeyCode.Space, Actions.JUMP);

keyboard.isActive(Actions.JUMP); // will be true while spacebar is pressed
```
