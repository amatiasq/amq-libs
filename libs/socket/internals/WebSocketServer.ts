import { Server } from 'http';
import WebSocket, { Server as WsServer } from 'ws';

import { emitter } from '@amatiasq/emitter';

import { Message } from '../Message';
import { ClientId } from './ClientId';
import { ICMType, InternalClientMessage } from './messaging';
import { parseJson } from './parseJson';
import { ServerClients } from './ServerClients';
import { ServerSocket } from './ServerSocket';

export class WebSocketServer<
  ServerMessage extends Message<any, any>,
  ClientMessage extends Message<any, any>
> {
  private readonly ws;
  private readonly clients = new ServerClients<ServerMessage, ClientMessage>();

  private readonly emitConnection = emitter<
    ServerSocket<ServerMessage, ClientMessage>
  >();
  readonly onConnection = this.emitConnection.subscribe;

  constructor(server: Server) {
    this.ws = new WsServer({ server });
    this.ws.on(
      'connection',
      (this._onConnection = this._onConnection.bind(this)),
    );
  }

  private _onConnection(ws: WebSocket) {
    const self = this;

    ws.on('close', onClose);
    ws.on('message', onMessage);

    function onClose() {
      ws.off('close', onClose);
      ws.off('message', onMessage);
    }

    function onMessage(payload: WebSocket.Data) {
      const msg = parseJson(payload as string) as InternalClientMessage;

      if (msg.type === ICMType.AMQ_CONNECT) {
        self.onClientConnected(ws);
      } else if (msg.type === ICMType.AMQ_RECONNECT) {
        self.onClientRecconect(ws, msg.data);
      } else {
        console.error('Unexpected message', msg.type);
      }

      onClose();
    }
  }

  private onClientConnected(ws: WebSocket) {
    const client = this.clients.add();
    client.bindTo(ws);
    this.emitConnection(client);
  }

  private onClientRecconect(ws: WebSocket, id: ClientId) {
    const client = this.clients.get(id) || this.clients.add(id);
    client.bindTo(ws);
  }
}
