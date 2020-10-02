import {
  Emitter,
  emitter,
  emitterWithChannels as channeled,
  EmitterWithChannels,
} from '@amatiasq/emitter';

export type MouseButtonEvent = MouseEvent & { button: MouseButton };

export enum MouseButton {
  LEFT = 1,
  CENTER = 2,
  RIGHT = 3,
}

export class MouseController {
  private readonly buttons = new Set<MouseButton>();
  private mousePos = { x: 0, y: 0 };

  private readonly emitMouseMove = emitter<MouseEvent>();
  readonly onMouseMove = this.emitMouseMove.subscribe;
  private readonly emitMouseDown = emitter<MouseButtonEvent>();
  readonly onMouseDown = this.emitMouseDown.subscribe;
  private readonly emitMouseUp = emitter<MouseButtonEvent>();
  readonly onMouseUp = this.emitMouseUp.subscribe;
  private readonly emitClick = emitter<MouseButtonEvent>();
  readonly onClick = this.emitClick.subscribe;
  private readonly emitDoubleClick = emitter<MouseButtonEvent>();
  readonly onDoubleClick = this.emitDoubleClick.subscribe;

  private readonly emitButtonDown = channeled<MouseButton, MouseButtonEvent>();
  readonly onButtonDown = this.emitButtonDown.subscribe;
  private readonly emitButtonUp = channeled<MouseButton, MouseButtonEvent>();
  readonly onButtonUp = this.emitButtonUp.subscribe;

  private readonly handleMouseDown = this.handleMouseAction(
    true,
    this.emitMouseDown,
    this.emitButtonDown,
  );

  private readonly handleMouseUp = this.handleMouseAction(
    false,
    this.emitMouseUp,
    this.emitButtonUp,
  );

  private readonly handleClick = this.handleMouseAction(false, this.emitClick);

  private readonly handleDoubleClick = this.handleMouseAction(
    false,
    this.emitDoubleClick,
  );

  get location() {
    return this.mousePos;
  }

  constructor() {
    this.handleMouseMove = this.handleMouseMove.bind(this);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);
    document.addEventListener('click', this.handleClick);
    document.addEventListener('dblclick', this.handleDoubleClick);
  }

  isPressed(button: MouseButton) {
    return this.buttons.has(button);
  }

  dispose() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('dblclick', this.handleDoubleClick);
  }

  private handleMouseMove(event: MouseEvent) {
    this.updateMousePosition(event);
    this.emitMouseMove(event);
  }

  private updateMousePosition(event: MouseEvent) {
    this.mousePos = { x: event.clientX, y: event.clientY };
  }

  private setPressedState(event: MouseEvent, isPressing: boolean) {
    const button = event.button as MouseButton;

    // is 0 if no button triggered the event
    if (!button) return;

    if (isPressing) {
      this.buttons.add(button);
    } else {
      this.buttons.delete(button);
    }
  }

  private handleMouseAction(
    isDown: boolean,
    emitter: Emitter<MouseButtonEvent>,
    channeled?: EmitterWithChannels<MouseButton, MouseButtonEvent>,
  ) {
    return (event: MouseButtonEvent) => {
      this.updateMousePosition(event);
      this.setPressedState(event, isDown);

      emitter(event);

      if (channeled) {
        channeled(event.button, event);
      }
    };
  }
}
