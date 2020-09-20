# nice-socket

Short description

## Installation

Install with `npm i --save @amatiasq/nice-socket`.

## Usage

```js
import { createServer } from 'http';
import { NiceSocket, NiceSocketServer } from '@amatiasq/nice-socket';

interface ClientMessage { foo: number }
interface ServerMessage { bar: number }

const niceServer = new NiceSocketServer<ClientMessage, ServerMessage>(createServer());

niceServer.onConnection(ws => {
  ws.on('close', () => logout(ws));
  ws.sendJson({ bar: 1 });

  ws.onJsonMessage(data => {
    console.log(data.foo);
  });
});
```
