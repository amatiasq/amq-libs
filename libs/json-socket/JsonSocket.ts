import { emitter } from '@amatiasq/emitter';

const DEFAULT_RECONNECTION_DELAY = 100;
const MAX_RECONNECT_ATTEMPTS = 14;

export class JsonSocket<TInput, TOutput> {
  RECONNECTION_DELAY = DEFAULT_RECONNECTION_DELAY;
  MAX_RECONNECT_ATTEMPTS = MAX_RECONNECT_ATTEMPTS;
  private reconnectionDelay = DEFAULT_RECONNECTION_DELAY;
  private reconnectAttempts = 0;
  private isReconnecting = false;

  private ws: WebSocket;
  readonly onMessage = emitter<TInput>();

  constructor(public readonly uri: string) {
    this.ws = this.init();
  }

  private init() {
    const socket = new WebSocket(this.uri);

    socket.onmessage = e => this.processMessage(e);
    socket.onerror = () => this.connectionLost();
    socket.onclose = () => this.connectionLost();

    return socket;
  }

  send(value: TOutput) {
    this.ws.send(JSON.stringify(value));
  }

  private processMessage(event: MessageEvent<any>) {
    this.reconnectionDelay = this.RECONNECTION_DELAY;
    this.reconnectAttempts = 0;

    let message: TInput;

    try {
      message = JSON.parse(event.data) as TInput;
    } catch (error) {
      console.error('Invalid JSON', event.data);
      return;
    }

    this.onMessage.emit(message);
  }

  private connectionLost() {
    if (this.isReconnecting) {
      return;
    }

    if (this.reconnectAttempts > this.MAX_RECONNECT_ATTEMPTS) {
      return console.error(
        `Websocket aborted after ${this.reconnectAttempts} attempts`,
      );
    }

    this.isReconnecting = true;

    console.warn(`Socket closed. Waiting ${this.reconnectionDelay / 1000}s`);

    setTimeout(() => {
      console.warn('Reconnecting...');
      this.reconnectionDelay *= 2;
      this.reconnectAttempts++;
      this.isReconnecting = false;
      this.ws = this.init();
    }, this.reconnectionDelay);
  }
}
