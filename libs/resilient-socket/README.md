# ResilientSocket

Short description

## Installation

Install with `npm i --save @amatiasq/resilient-socket`.

## Usage

```js
import { ResilientSocket } from '@amatiasq/resilient-socket';

const socket = new ResilientSocket('wss:sockethost.com');

socket.onOpen(event => console.log('Socket open'));
socket.onClose(event => console.log('Socket closed'));

socket.onMessage(event => console.log(event.data));

// Triggered if can't reconnect after `socket.MAX_RECONNECT_ATTEMPTS` attempts
socket.onError(event => console.log('Reconnection failed'));

socket.onReconnect(event =>
  console.log(
    `Disconnected for ${Date.now() - event.disconnectedTime} milliseconds`,
  ),
);

// If socket is reconnecting this will be sent once connection is restored
socket.send('hello');
```

## Reconnection

When the socket is disconnected it will automatically try to reconnect after 100ms. If that attempt fails it will try again after 200ms, then 400ms...

After 15 attempts (last wait is 55 minutes) it will stop retrying.

`RECONNECTION_DELAY` (defaults 100ms) and `MAX_RECONNECT_ATTEMPTS` (defaults 15) can be configured per-instance.
