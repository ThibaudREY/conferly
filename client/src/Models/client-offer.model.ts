import SimplePeer from 'simple-peer';

export default class ClientOffer {
    public offer: SimplePeer.SignalData;
    public peers: {[key: string]: string};


    constructor(offer: SimplePeer.SignalData, peers: { [p: string]: string }) {
        this.offer = offer;
        this.peers = peers;
    }
}
