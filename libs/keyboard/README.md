# KeyboardController

Simple class to track keyboard pressed keys.

## Installation

Install with `npm i --save @amatiasq/keyboard`.

## KeyboardController

Manages keyboard events

```js
import { KeyboardController, KeyCode } from '@amatiasq/keyboard';

const keyboard = new KeyboardController();

keyboard.onKeyCodeDown(KeyCode.Enter, event => console.log('Enter key down'));
keyboard.onKeyCodeUp(KeyCode.Enter, event => console.log('Enter key up'));

keyboard.onKeyDown(event => console.log(`Key pressed ${event.code}`));
keyboard.onKeyUp(event => console.log(`Key pressed ${event.code}`));

keyboard.isPressed(KeyCode.Space); // false
```

## KeyboardActions

Manages keyboard bindings

```js
import { KeyboardActions, KeyCode } from '@amatiasq/keyboard';

enum MyActions {
  RUN,
  JUMP,
  SHOOT,
}

const keyboard = new KeyboardActions<MyActions>();

keyboard.setKeyMap(KeyCode.ArrowRight, Actions.RUN);
keyboard.setKeyMap(KeyCode.Space, Actions.JUMP);
keyboard.setKeyMap(KeyCode.ArrowUp, Actions.JUMP);

keyboard.onActivate(Actions.JUMP, () => console.log('Start jump'));
keyboard.onDectivate(Actions.JUMP, () => console.log('End jump'));
keyboard.onChange(actions => console.log('Active actions', actions));

keyboard.isActive(Actions.JUMP); // will be true while spacebar or arrow up is pressed
```
