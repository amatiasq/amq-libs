/// <reference path="./freeice.d.ts" />
import freeice from 'freeice';

import { emitter } from '@amatiasq/emitter';

export class PeerConnection {
  private rtc = this.createRtc();
  readonly onTrackReceived = emitter<RTCTrackEvent>();
  readonly onDataChannel = emitter<RTCDataChannelEvent>();

  async createOffer(options: RTCOfferOptions = {}) {
    const offer = await this.rtc.createOffer(options);
    await this.rtc.setLocalDescription(offer);
    await this.processIceCandidates();
    return this.rtc.localDescription!;
  }

  async acceptOffer(
    offer: RTCSessionDescription,
    options: RTCOfferOptions = {},
  ) {
    await this.setRemoteDescription(offer);
    return this.createAnswer(options);
  }

  acceptAnswer(answer: RTCSessionDescription) {
    return this.setRemoteDescription(answer);
  }

  addStream(stream: MediaStream) {
    stream.getTracks().forEach(x => this.addTrack(x, stream));
  }

  addTrack(track: MediaStreamTrack, stream: MediaStream) {
    return this.rtc.addTrack(track, stream);
  }

  reset() {
    this.rtc.close();
    this.rtc = this.createRtc();
  }

  close() {
    this.rtc.close();
  }

  private async createAnswer(options: RTCOfferOptions = {}) {
    const answer = await this.rtc.createAnswer(options);
    await this.rtc.setLocalDescription(answer);
    await this.processIceCandidates();
    return this.rtc.localDescription!;
  }

  private createRtc() {
    const conn = new RTCPeerConnection({ iceServers: freeice() });
    conn.ontrack = e => this.onTrackReceived.emit(e);
    conn.ondatachannel = e => this.onDataChannel.emit(e);
    return conn;
  }

  private processIceCandidates() {
    return new Promise<void>(resolve => {
      this.rtc.onicecandidate = ({ candidate }) =>
        candidate == null && resolve();
    });
  }

  private setRemoteDescription(desc: RTCSessionDescription) {
    return this.rtc.setRemoteDescription(new RTCSessionDescription(desc));
  }
}
