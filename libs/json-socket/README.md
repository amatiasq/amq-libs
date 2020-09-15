# JsonSocket

WebSocket with JSON communication and [automatic reconnection](#reconnection).

## Installation

Install with `npm i --save @amatiasq/json-socket`.

## Usage

```js
import { JsonSocket } from '@amatiasq/json-socket';

interface InputMessage {
  foo: number;
}
interface OutputMessage {
  bar: string;
}

const socket = new JsonSocket<InputMessage, OutputMessage>('wss:sockethost.com');

socket.onMessage(message => {
  // message is of type InputMessage
  console.log(message.foo);
})

// typescript will warn if this isn't an valid OutputMessage
socket.send({
  bar: 'test',
});
```

## Reconnection

When the socket is disconnected it will automatically try to reconnect after 100ms. If that attempt fails it will try again after 200ms, then 400ms...

After 15 attempts (last wait is 55 minutes) it will stop retrying.

`RECONNECTION_DELAY` (defaults 100ms) and `MAX_RECONNECT_ATTEMPTS` (defaults 15) can be configured per-instance.
