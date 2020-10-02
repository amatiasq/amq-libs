import { emitter } from '@amatiasq/emitter';

const DEFAULT_RECONNECTION_DELAY = 100;
const MAX_RECONNECT_ATTEMPTS = 14;

type Message = string | ArrayBufferLike | Blob | ArrayBufferView;

export interface SocketReconnectionEvent extends Event {
  disconnectedTime: Date;
}

export interface ResilientSocketOptions {
  reconnectionDelay?: number;
  maxReconnectAttempts?: number;
}

export class ResilientSocket {
  RECONNECTION_DELAY;
  MAX_RECONNECT_ATTEMPTS;

  private ws: WebSocket | null;

  private reconnectionDelay = DEFAULT_RECONNECTION_DELAY;
  private reconnectAttempts = 0;
  private disconnectedAt = new Date();
  private isReconnecting = false;
  private isFirstConnection = true;
  private messageQueue: Message[] = [];

  private readonly emitOpen = emitter<Event>();
  readonly onOpen = this.emitOpen.subscribe;

  private readonly emitError = emitter<Event>();
  readonly onError = this.emitError.subscribe;

  private readonly emitClose = emitter<Event>();
  readonly onClose = this.emitClose.subscribe;

  private readonly emitMessage = emitter<MessageEvent>();
  readonly onMessage = this.emitMessage.subscribe;

  private readonly emitReconnect = emitter<SocketReconnectionEvent>();
  readonly onReconnect = this.emitReconnect.subscribe;

  get isConnected() {
    return !this.isFirstConnection && !this.isReconnecting;
  }

  get websocket() {
    return this.ws;
  }

  constructor(
    public readonly uri: string,
    {
      reconnectionDelay = DEFAULT_RECONNECTION_DELAY,
      maxReconnectAttempts = MAX_RECONNECT_ATTEMPTS,
    }: ResilientSocketOptions = {},
  ) {
    this.connectionOpen = this.connectionOpen.bind(this);
    this.processMessage = this.processMessage.bind(this);
    this.connectionLost = this.connectionLost.bind(this);

    this.ws = this.init();
    this.RECONNECTION_DELAY = reconnectionDelay;
    this.MAX_RECONNECT_ATTEMPTS = maxReconnectAttempts;
  }

  send(data: Message) {
    if (this.isConnected) this.ws!.send(data);
    else this.messageQueue.push(data);
  }

  private init() {
    const socket = new WebSocket(this.uri);

    socket.addEventListener('open', this.connectionOpen);
    socket.addEventListener('message', this.processMessage);
    socket.addEventListener('error', this.connectionLost);
    socket.addEventListener('close', this.connectionLost);

    return socket;
  }

  private unbind() {
    const socket = this.ws;
    if (!socket) return;

    socket.removeEventListener('open', this.connectionOpen);
    socket.removeEventListener('message', this.processMessage);
    socket.removeEventListener('error', this.connectionLost);
    socket.removeEventListener('close', this.connectionLost);

    this.ws = null;
    return socket;
  }

  private processMessage(event: MessageEvent<any>) {
    this.emitMessage(event);
  }

  private connectionOpen(event: Event) {
    this.resetReconnectionCounters();

    if (this.isFirstConnection) {
      this.isFirstConnection = false;
      this.emitOpen(event);
    } else {
      this.emitReconnect(
        Object.assign(event, { disconnectedTime: this.disconnectedAt }),
      );
    }

    this.processMessageQueue();
  }

  private connectionLost(event: Event) {
    if (this.isReconnecting) {
      return;
    }

    if (this.reconnectAttempts > this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectionFailed(event);
    }

    if (this.reconnectAttempts === 0) {
      this.isReconnecting = true;
      this.disconnectedAt = new Date();
    }

    this.unbind();
    this.scheduleReconnection();
  }

  private resetReconnectionCounters() {
    this.reconnectionDelay = this.RECONNECTION_DELAY;
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
  }

  private processMessageQueue() {
    for (const message in this.messageQueue) {
      this.ws!.send(message);
    }

    this.messageQueue.length = 0;
  }

  private reconnectionFailed(event: Event) {
    this.emitError(event);
    return console.error(
      `Websocket aborted after ${this.reconnectAttempts} attempts`,
    );
  }

  private scheduleReconnection() {
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
    const socket = this.unbind();

    if (socket) {
      socket.onclose = this.emitClose;
      socket.close();
    }
  }
}
