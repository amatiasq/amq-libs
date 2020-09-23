import { emitter, emitterWithChannels } from '@amatiasq/emitter';

import { KeyCode } from './KeyCode';
import { KeyCodeEvent } from './KeyCodeEvent';

type Native = (event: KeyboardEvent) => void;

export class KeyboardController {
  private readonly pressed = new Set<KeyCode>();
  private readonly codeToKey = new Map<KeyCode, string>();

  private readonly emitKeyCodeDown = emitterWithChannels<
    KeyCode,
    KeyCodeEvent
  >();
  private readonly emitKeyCodeUp = emitterWithChannels<KeyCode, KeyCodeEvent>();
  private readonly emitKeyDown = emitter<KeyCodeEvent>();
  private readonly emitKeyUp = emitter<KeyCodeEvent>();

  readonly onKeyCodeDown = this.emitKeyCodeDown.subscribe;
  readonly onKeyCodeUp = this.emitKeyCodeUp.subscribe;
  readonly onKeyDown = this.emitKeyDown.subscribe;
  readonly onKeyUp = this.emitKeyUp.subscribe;

  isPaused = false;

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    document.addEventListener('keydown', this.handleKeyDown as Native);
    document.addEventListener('keyup', this.handleKeyUp as Native);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  isPressed(key: KeyCode) {
    return this.pressed.has(key);
  }

  getUserKey(code: KeyCode) {
    return this.codeToKey.has(code) ? this.codeToKey.get(code) : null;
  }

  dispose() {
    document.removeEventListener('keydown', this.handleKeyDown as Native);
    document.removeEventListener('keyup', this.handleKeyUp as Native);
  }

  private handleKeyDown(event: KeyCodeEvent) {
    this.onEvent(event);

    if (this.isPressed(event.code)) {
      return;
    }

    this.pressed.add(event.code);

    if (this.isPaused) {
      return;
    }

    this.emitKeyDown(event);
    this.emitKeyCodeDown(event.code, event);
  }

  private handleKeyUp(event: KeyCodeEvent) {
    this.onEvent(event);

    if (!this.isPressed(event.code)) {
      return;
    }

    this.pressed.delete(event.code);

    if (this.isPaused) {
      return;
    }

    this.emitKeyUp(event);
    this.emitKeyCodeUp(event.code, event);
  }

  private onEvent(event: KeyCodeEvent) {
    this.codeToKey.set(event.code, event.key);
  }
}
