import { emitter, emitterWithChannels } from '@amatiasq/emitter';

import { KeyboardController } from './KeyboardController';
import { KeyCode } from './KeyCode';
import { KeyCodeEvent } from './KeyCodeEvent';

type EnumDeclaration = number | string;

export class KeyboardActions<T extends EnumDeclaration> {
  private readonly keyboard = new KeyboardController();
  private readonly keymap: { [id: string]: T } = {};
  private readonly actions = new Set<T>();
  private readonly subscriptions: (() => boolean)[];

  private readonly emitChange = emitter<T[]>();
  private readonly emitActivate = emitterWithChannels<T, void>();
  private readonly emitDeactivate = emitterWithChannels<T, void>();

  readonly onChange = this.emitChange.subscribe;
  readonly onActivate = this.emitActivate.subscribe;
  readonly onDeactivate = this.emitDeactivate.subscribe;

  get isPaused() {
    return this.keyboard.isPaused;
  }

  constructor() {
    this.subscriptions = [
      this.keyboard.onKeyDown(this.handleKeyDown),
      this.keyboard.onKeyUp(this.handleKeyUp),
    ];
  }

  // Composition

  pause() {
    this.keyboard.pause();
  }

  resume() {
    this.keyboard.resume();
  }

  getUserKey(code: KeyCode) {
    this.keyboard.getUserKey(code);
  }

  // Features

  setKeyMap(key: KeyCode, action: T) {
    this.keymap[key] = action;
  }

  isActive(action: T) {
    return this.actions.has(action);
  }

  dispose() {
    this.subscriptions.forEach(x => x());
    this.keyboard.dispose();
  }

  // Helpers

  setDirections(up: T, down: T, left: T, right: T) {
    this.setArrows(up, down, left, right);
    this.setWSAD(up, down, left, right);
  }

  setArrows(up: T, down: T, left: T, right: T) {
    this.keymap[KeyCode.ArrowUp] = up;
    this.keymap[KeyCode.ArrowDown] = down;
    this.keymap[KeyCode.ArrowLeft] = left;
    this.keymap[KeyCode.ArrowRight] = right;
  }

  setWSAD(up: T, down: T, left: T, right: T) {
    this.keymap[KeyCode.KeyW] = up;
    this.keymap[KeyCode.KeyS] = down;
    this.keymap[KeyCode.KeyA] = left;
    this.keymap[KeyCode.KeyD] = right;
  }

  // Internals

  private getActionFor(code: KeyCode) {
    if (!KeyCode[code]) {
      console.log(`Missing key code: ${code}`);
    }

    return this.keymap[code];
  }

  private readonly handleKeyDown = this.handle(action => {
    if (this.actions.has(action)) {
      return;
    }

    this.actions.add(action);
    this.emitActivate(action);
    this.emitChange(Array.from(this.actions));
  });

  private readonly handleKeyUp = this.handle(action => {
    if (!this.actions.has(action)) {
      return;
    }

    this.actions.delete(action);
    this.emitDeactivate(action);
    this.emitChange(Array.from(this.actions));
  });

  private handle(operation: (action: T) => void) {
    return (event: KeyCodeEvent) => {
      const action = this.getActionFor(event.code);

      if (action != null) {
        operation(action);
      }
    };
  }
}
