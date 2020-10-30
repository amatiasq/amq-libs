import { Message } from '../Message';
import { ClientId } from './ClientId';

export enum ICMType {
  AMQ_CONNECT = 'AMQ_CONNECT',
  AMQ_RECONNECT = 'AMQ_RECONNECT',
  AMQ_DISCONNECT = 'AMQ_DISCONNECT',
}

export type InternalClientMessage =
  | Message<ICMType.AMQ_CONNECT>
  | Message<ICMType.AMQ_RECONNECT, ClientId>
  | Message<ICMType.AMQ_DISCONNECT, ClientId | void>;

export enum ISMType {
  AMQ_CONNECTED = 'AMQ_CONNECTED',
}

export type InternalServerMessage = Message<ISMType.AMQ_CONNECTED, ClientId>;
