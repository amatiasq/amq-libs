import { IncomingMessage, Server } from 'http';
import WebSocket, { Server as WebSocketServer } from 'ws';

const INVALID_JSON = Symbol();

export interface INiceSocket<TIn = any, TOut = any> {
  sendJson(value: TOut): void;
  onJsonMessage(listener: (this: this, data: TIn) => void): this;
}

export class NiceSocket<TIn = any, TOut = any> extends WebSocket {
  sendJson(value: TOut): void {
    this.send(JSON.stringify(value));
  }

  onJsonMessage(listener: (this: this, data: TIn) => void): this {
    this.on('message', msg => {
      const data = parseJson(msg as string);

      if (data !== INVALID_JSON) {
        listener.call(this, data);
      }
    });

    return this;
  }
}

export class NiceSocketServer<TIn = any, TOut = any> extends WebSocketServer {
  constructor(server: Server) {
    super({ server });
  }

  onConnection(
    listener: (
      this: NiceSocketServer<TIn, TOut>,
      socket: NiceSocket<TIn, TOut>,
      request: IncomingMessage,
    ) => void,
  ) {
    this.on('connection', (ws, req) => {
      const niceSocket = Object.create(ws, {
        constructor: getDescriptor('constructor'),
        sendJson: getDescriptor('sendJson'),
        onJsonMessage: getDescriptor('onJsonMessage'),
      }) as NiceSocket<TIn, TOut>;

      listener.call(this, niceSocket, req);
    });
  }
}

function getDescriptor(key: string) {
  return Object.getOwnPropertyDescriptor(NiceSocket.prototype, key)!;
}

function parseJson(text: string) {
  try {
    return JSON.parse(text as string);
  } catch (e) {
    console.warn('Invalid JSON:', text);
    return INVALID_JSON;
  }
}
