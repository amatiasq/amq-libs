import { Message } from '../Message';
import { ClientId } from './ClientId';
import { ServerSocket } from './ServerSocket';

export class ServerClients<
  ServerMessage extends Message<any, any>,
  ClientMessage extends Message<any, any>
> {
  private lastId = 0;
  private readonly clients = new Map<
    ClientId,
    ServerSocket<ServerMessage, ClientMessage>
  >();

  get(id: ClientId) {
    return this.clients.get(id) || null;
  }

  add(id: ClientId = this.getNextId()) {
    const client = new ServerSocket<ServerMessage, ClientMessage>(id);
    this.remove(id);
    this.clients.set(client.id, client);
    return client;
  }

  remove(id: ClientId) {
    if (!this.clients.has(id)) {
      return false;
    }

    const client = this.clients.get(id)!;
    this.clients.delete(id);
    client.destroy();
    return true;
  }

  private getNextId(): ClientId {
    return ++this.lastId as any;
  }
}
