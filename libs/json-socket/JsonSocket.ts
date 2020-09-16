import { emitter } from '@amatiasq/emitter';

const DEFAULT_RECONNECTION_DELAY = 100;
const MAX_RECONNECT_ATTEMPTS = 14;

export class JsonSocket<TInput, TOutput> {
  RECONNECTION_DELAY = DEFAULT_RECONNECTION_DELAY;
  MAX_RECONNECT_ATTEMPTS = MAX_RECONNECT_ATTEMPTS;

  private reconnectionDelay = DEFAULT_RECONNECTION_DELAY;
  private reconnectAttempts = 0;
  private disconnectedAt = new Date();
  private isReconnecting = false;
  private isFirstConnection = true;

  private ws = this.init();

  readonly onOpen = emitter<JsonSocket<TInput, TOutput>>();
  readonly onMessage = emitter<TInput>();
  readonly onReconnect = emitter<Date>();

  get isConnected() {
    return !this.isFirstConnection && !this.isReconnecting;
  }

  constructor(public readonly uri: string) {}

  private init() {
    const socket = new WebSocket(this.uri);

    socket.onopen = () => this.connectionOpen();
    socket.onmessage = e => this.processMessage(e);
    socket.onerror = () => this.connectionLost();
    socket.onclose = () => this.connectionLost();

    return socket;
  }

  send(value: TOutput) {
    this.ws.send(JSON.stringify(value));
  }

  private processMessage(event: MessageEvent<any>) {
    let message: TInput;

    try {
      message = JSON.parse(event.data) as TInput;
    } catch (error) {
      console.error('Invalid JSON', event.data);
      return;
    }

    this.onMessage.emit(message);
  }

  private connectionOpen() {
    this.reconnectionDelay = this.RECONNECTION_DELAY;
    this.reconnectAttempts = 0;
    this.isReconnecting = false;

    if (this.isFirstConnection) {
      this.isFirstConnection = false;
      this.onOpen.emit(this);
    } else {
      this.onReconnect.emit(this.disconnectedAt);
    }
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

    if (this.reconnectAttempts === 0) {
      this.isReconnecting = true;
      this.disconnectedAt = new Date();
    }

    const message = `Socket closed. Waiting ${this.reconnectionDelay / 1000}s`;
    const reconnecting = 'Reconnecting...';
    const singleLine = this.reconnectAttempts < 1000;

    console.debug(`${message} ${singleLine ? reconnecting : ''}`);

    setTimeout(() => {
      if (!singleLine) {
        console.debug(reconnecting);
      }

      this.reconnectionDelay *= 2;
      this.reconnectAttempts++;
      this.ws = this.init();
    }, this.reconnectionDelay);
  }

  close() {
    this.ws.onclose = null;
    this.ws.close();
  }
}
