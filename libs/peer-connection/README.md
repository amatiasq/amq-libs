# PeerConnection

WebRTC made simple.

## Installation

Install with `npm i --save @amatiasq/peer-connection`.

## Prerrequisites

This requires you to provide some way to communicate the peers. That's usually a server that passes the `offer` and `answer` from one client to the other one.

## Usage

Let's say we have two clients, Bob and Alice. The handshake process consists of an exchange of an `offer` and an `answer`:

#### Bob

```js
import { PeerConnection } from '@amatiasq/peer-connection';

const conn = new PeerConnection();

// Prepare to receive events
conn.onTrackReceived(event => play(event.streams[0]));
conn.onDataChannel(event => ...);

// First set the streams we want to send
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
conn.addStream(stream);

// Then send a connection offer
const offer = await conn.createOffer({
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
});

const answer = await sendToAliceSomehow(offer);

// And pass the answer back to PeerConnection
conn.receiveAnswer(answer);

// DONE
```

#### Alice

```js
import { PeerConnection } from '@amatiasq/peer-connection';

const conn = new PeerConnection();

// Prepare to receive events
conn.onTrackReceived(event => play(event.streams[0]));
conn.onDataChannel(event => ...);

// This probably comes from websocket in your app
const offer = await receiveFromBobSomehow();

// Now we add the tracks
const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
conn.addStream(stream);

// Generate an answer for the offer
const answer = await conn.receiveOffer(offer, {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
});

await sendToBobSomehow(answer);

// DONE
```

## Changing data streams

Apparently (as far as I know) if you want to change the streams exchanged (turn off video for example), we need to close the connection and create a new offer again.

You can call `conn.reset()` which will close the connection and prepare the `PeerConnection` instance for a new connection. You'll have to start the handshake process again.
