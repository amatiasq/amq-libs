import { emitter, emitterWithChannels } from '@amatiasq/emitter';
import {
  ResilientSocket,
  ResilientSocketOptions,
} from '@amatiasq/resilient-socket';

import { Message, MessageData } from '../Message';
import { ClientId } from './ClientId';
import { ICMType, InternalClientMessage, ISMType } from './messaging';
import { parseJson } from './parseJson';

export class ClientSocket<
  ClientMessage extends Message<any, any>,
  ServerMessage extends Message<any, any>
> {
  private clientId?: ClientId;
  private readonly socket;
  private readonly typeListeners = emitterWithChannels<
    ServerMessage['type'],
    ServerMessage['data']
  >();

  private readonly emitConnected = emitter<ClientId>();
  readonly onConnected = this.emitConnected.subscribe;

  private readonly emitMessage = emitter<ServerMessage>();
  readonly onMessage = this.emitMessage.subscribe;

  readonly onError;
  readonly onClose;

  constructor(
    public readonly uri: string,
    options: ResilientSocketOptions = {},
  ) {
    this.socket = new ResilientSocket(uri, options);

    this.onError = this.socket.onError;
    this.onClose = this.socket.onClose;

    this.socket.onOpen((this._open = this._open.bind(this)));
    this.socket.onReconnect((this._reconnect = this._reconnect.bind(this)));
    this.socket.onMessage((this._message = this._message.bind(this)));
  }

  send<Type extends ClientMessage['type']>(
    type: Type,
    data: MessageData<ClientMessage, Type>,
  ) {
    this.socket.send(JSON.stringify({ type, data }));
  }

  onMessageType<Type extends ServerMessage['type']>(
    type: Type,
    listener: (data: MessageData<ServerMessage, Type>) => void,
  ) {
    this.typeListeners.subscribe(type, listener);
  }

  close() {
    this._sendInternal(ICMType.AMQ_DISCONNECT, this.clientId);
  }

  private _open() {
    this._sendInternal(ICMType.AMQ_CONNECT, undefined);
  }

  private _reconnect() {
    if (this.clientId) {
      this._sendInternal(ICMType.AMQ_RECONNECT, this.clientId);
    } else {
      this._sendInternal(ICMType.AMQ_CONNECT, undefined);
    }
  }

  private _message(event: MessageEvent<any>) {
    const message = parseJson(event.data);

    if (message.type in ISMType) {
      if (message.type === ISMType.AMQ_CONNECTED) {
        this.clientId = message.data;
        this.emitConnected(message.data);
      }
      return;
    }

    this.emitMessage(message);
    this.typeListeners(message.type, message.data);
  }

  private _sendInternal<Type extends InternalClientMessage['type']>(
    type: Type,
    data: MessageData<InternalClientMessage, Type>,
  ) {
    this.socket.send(JSON.stringify({ type, data }));
  }
}
