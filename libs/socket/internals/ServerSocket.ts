import WebSocket from 'ws';

import { emitter, emitterWithChannels } from '@amatiasq/emitter';

import { Message, MessageData } from '../Message';
import { ClientId } from './ClientId';
import { ICMType, InternalServerMessage, ISMType } from './messaging';
import { parseJson } from './parseJson';

export class ServerSocket<
  ServerMessage extends Message<any, any>,
  ClientMessage extends Message<any, any>
> {
  private ws?: WebSocket | null;

  private readonly typeListeners = emitterWithChannels<
    ClientMessage['type'],
    ClientMessage['data']
  >();

  private readonly emitMessage = emitter<ClientMessage>();
  readonly onMessage = this.emitMessage.subscribe;

  private readonly emitDestroy = emitter<void>();
  readonly onDestroy = this.emitDestroy.subscribe;

  constructor(readonly id: ClientId) {
    this._onClose = this._onClose.bind(this);
    this._onMessage = this._onMessage.bind(this);
  }

  bindTo(ws: WebSocket) {
    this._onClose();
    this.ws = ws;
    ws.on('close', this._onClose);
    ws.on('message', this._onMessage);

    ws.send(
      JSON.stringify({
        type: ISMType.AMQ_CONNECTED,
        data: this.id,
      } as InternalServerMessage),
    );
  }

  send<Type extends ServerMessage['type']>(
    type: Type,
    data: MessageData<ServerMessage, Type>,
  ) {
    this.ws!.send(JSON.stringify({ type, data }));
  }

  onMessageType<Type extends ClientMessage['type']>(
    type: Type,
    listener: (data: MessageData<ClientMessage, Type>) => void,
  ) {
    this.typeListeners.subscribe(type, listener);
  }

  destroy() {
    this.emitDestroy();
  }

  private _onMessage(payload: string) {
    const msg = parseJson(payload as string) as ClientMessage;

    if (msg.type === ICMType.AMQ_DISCONNECT) {
      this._onClose();
      this.destroy();
      return;
    }

    this.emitMessage(msg);
    this.typeListeners(msg.type, msg.data);
  }

  private _onClose() {
    if (this.ws) {
      this.ws.off('close', this._onClose);
      this.ws.off('message', this._onMessage);
      this.ws = null;
    }
  }
}
