import SimplePeer from 'simple-peer';

export default class JoinAcknoledgement {
    public offer: SimplePeer.SignalData;
    public roomId: string;
    public peerId?: string;

    constructor(offer: SimplePeer.SignalData, roomId: string, peerId?: string) {
        this.offer = offer;
        this.roomId = roomId;
        this.peerId = peerId;
    }
}