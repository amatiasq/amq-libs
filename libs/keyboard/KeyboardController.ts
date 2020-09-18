import { KeyCode } from './KeyCode';

export { KeyCode };

type EnumDeclaration = number | string;
type Native = (event: KeyboardEvent) => void;
type ExtendedKeyboardEvent = KeyboardEvent & { code: KeyCode };

export class KeyboardController<T extends EnumDeclaration> {
  private readonly keymap: { [id: string]: T } = {};
  private readonly actions = new Set<T>();
  private readonly codeToKey = new Map<KeyCode, string>();
  private readonly onKeyDownListeners = new Map<KeyCode, Native[]>();
  private readonly onKeyUpListeners = new Map<KeyCode, Native[]>();

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);

    document.addEventListener('keydown', this.handleKeyDown as Native);
    document.addEventListener('keyup', this.handleKeyUp as Native);
  }

  onKeyDown(code: KeyCode, listener: Native) {
    addListener(this.onKeyDownListeners, code, listener);
  }

  onKeyUp(code: KeyCode, listener: Native) {
    addListener(this.onKeyUpListeners, code, listener);
  }

  setKeyMap(key: KeyCode, action: T) {
    this.keymap[key] = action;
  }

  isActive(action: T) {
    return this.actions.has(action);
  }

  getUserKey(code: KeyCode) {
    return this.codeToKey.has(code) ? this.codeToKey.get(code) : null;
  }

  /*
   * Helpers
   */

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

  /*
   * Internals
   */

  private handleKeyDown(event: ExtendedKeyboardEvent) {
    this.onEvent(event);
    const action = this.getActionFor(event.code);

    if (action != null) {
      this.actions.add(action);
    }

    triggerListeners(event, this.onKeyDownListeners);
  }

  private handleKeyUp(event: ExtendedKeyboardEvent) {
    const action = this.getActionFor(event.code);

    if (action != null) {
      this.actions.delete(action);
    }

    triggerListeners(event, this.onKeyUpListeners);
  }

  private getActionFor(code: KeyCode) {
    if (!KeyCode[code]) {
      console.log(`Missing key code: ${code}`);
    }

    return this.keymap[code];
  }

  private onEvent(event: ExtendedKeyboardEvent) {
    this.codeToKey.set(event.code, event.key);
  }
}

function addListener(
  list: Map<KeyCode, Native[]>,
  code: KeyCode,
  listener: Native,
) {
  if (list.has(code)) {
    list.get(code)!.push(listener);
  } else {
    list.set(code, [listener]);
  }
}

function triggerListeners(
  event: ExtendedKeyboardEvent,
  list: Map<KeyCode, Native[]>,
) {
  const listeners = list.get(event.code);

  if (listeners) {
    listeners.forEach(x => x(event));
  }
}
