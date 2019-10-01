import JoinRequest         from '../Models/join-request.model';
import Conference          from '../Models/conference.model';
import uid                 from 'uid-safe';
import Peer                from 'simple-peer';
import io                  from 'socket.io-client';
import ClientOffer         from '../Models/client-offer.model';
import SimplePeer          from 'simple-peer';
import JoinAcknoledgement  from '../Models/join-acknoledgement.model';
import { injectable }      from 'inversify';
import { BehaviorSubject } from 'rxjs';

export const subscriber = new BehaviorSubject(new Map());

@injectable()
export default class PeerService {

    static OPEN_CNTS_AS_INIT: string = 'OPEN_CNTS_AS_INIT___';

    private readonly _peerConnections: Map<string, Peer.Instance>;
    private signalingData: any;
    private peers: { [key: string]: string } = {};
    private peerId: string = '';
    private roomId: string = '';
    private currentPeerConnection: Peer.Instance; // TODO: Maybe need a stack (if initiator is handling several processes at once
    private readonly server?: SocketIOClient.Socket;


    /**
     * How it is supposed to work :
     *
     *                         RoomId
     *                      Conference()
     *  1    I   ------------------------------------->      Server                                                     (create)
     *                                                                     C's peerId (stored by server,
     *                                                                     will be later used for routing
     *                                                                     newer client signaling data to C)
     *                                                                                      + roomId
     *                                                                              JoinRequest()
     *  2                                                    Server      <------------------------------     C          (join-request)
     *                      peerId + roomId
     *                       JoinRequest()
     *  2bis I  <---------------------------------------     Server                                                     (offer-request)
     *                      I's Signaling data +
     *                      peerId + roomId
     *  2ter I  --------------------------------------->     Server                                                     (offer-response)
     *                                                                          I's signaling data
     *  3                                                    Server      ------------------------------>     C          (join-response)
     *                                                                          C's signaling data
     *  4                                                    Server      <------------------------------     C          (join-ack)
     *              C's signaling data + Peer list
     *                          ClientOffer()
     *  5    I   <---------------------------------------    Server                                                     (client-offer)
     *                                           Peer list
     *  6    I   -------------------------------------------------------------------------------------->     C          (connect on data channel)
     *                                                              {peerId -> Signaling data} + peerId + roomId
     *  7                                             ------ Server      <------------------------------     C          (initiator-offers)
     *                                 C as init     /         |
     *                                   offer     /           | C as init
     *                                 + peerID  /             |    offer
     *   8                                     / (join-response)\ + peerID
     *                          Existing     /                   \         Existing
     *                             C1    <-                       -------->   C2
     *
     *                                                                 C1 or C2 signaling data + C's PeerID
     *  9                                                   Server     <---------------------------------    C1 or C2   (join-ack)
     *                                             (Hey there's a peerID,
     *                                             Do not send the data to the
     *                                             Session initiator, instead
     *                                             let's find the socket according
     *                                             to this id)
     *               C1 or C2's signaling data + Peer list
     *                          ClientOffer()                                                                           (client-offer)
     *       C    <-------------------------------------    Server
     */
    constructor() {
        this._peerConnections = new Map<string, Peer.Instance>();
        this.currentPeerConnection = new Peer();
        this.server = io('localhost:9000'); // TODO: Find a way to inject configuration

        /**
         * Step 2bis
         */
        this.server.on('offer-request', (request: JoinRequest) => this.onOfferRequest(request));

        /**
         * Steps 5
         * Triggers when new client sends back its offer to this Session initiator instance
         */
        this.server.on('client-offer', (data: ClientOffer, peerId: string, sessionInitiator: boolean, emitterPeerId: string) => this.onClientOffer(data, peerId, sessionInitiator, emitterPeerId));
    }

    /**
     * Step 1
     * Sends an offer as well as as the room identifier
     * returns the room id
     */
    public async createRoom(): Promise<string> {
        this.peerId = uid.sync(7);
        this.roomId = uid.sync(7);
        console.log('Generating roomId...');

        console.log('PeerId: ', this.peerId);

        const conference = new Conference(this.roomId);

        if (!this.server)
            throw new Error('Server is unreachable');

        this.server.emit('create', await conference);
        console.log('Emiting `create`: ' + await conference);
        return this.roomId;
    }

    /**
     * Steps 2, 3 and 4
     * @param roomId
     */
    public async joinRoom(roomId: string) {

        this.roomId = roomId;

        await new Promise(async (resolve, reject) => {

            if (!this.server) {
                reject(new Error('Server is unreachable'));
            } else {
                // Joining room
                this.peerId = uid.sync(7);
                console.log('PeerId : ' + this.peerId);
                this.server.emit('join-request', new JoinRequest(roomId, this.peerId));
                console.log('Emitting `join-request` from ' + this.peerId);

                // Wating for server response
                await this.server.on('join-response', (offer: SimplePeer.SignalData, peerId: string) => this.onJoinResponse(offer, peerId, roomId))
            }
        });
    }

    private async onJoinResponse(offer: SimplePeer.SignalData, peerId: string, roomId: string) {
        this.currentPeerConnection = new Peer({
            initiator: false,
            trickle: false
        });
        console.log('Received `join-response` with peerId ' + peerId);

        this.registerActions(this.currentPeerConnection);

        // Accepting offer
        this.currentPeerConnection.signal(offer);

        // Generating new offer and answer (accepted)
        const signalingData = await this.getSignalingData(this.currentPeerConnection);

        // Emiting the offer back to the server
        if (!this.server)
            throw new Error('Server in unreachable');

        this.server.emit('join-ack', new JoinAcknoledgement(await signalingData, roomId, peerId), this.peerId);
        console.log('Emitting `join-ack`');

        // this.currentConnection is about to be an established datachannel connection
        // on the client (non-initiator) side of it
        // we need to store it
        if (peerId) {
            this.peerConnections.set(peerId, this.currentPeerConnection);
            this.updateObservable();
        }
    }

    /**
     * Triggered on Room Initiator when connection is established
     * @param pc
     */
    private registerInitiatorActions(pc: Peer.Instance) {

        // Step 6
        // As Session initiator we should have just received the peers list from the server
        // Lets send it to the newly arrived one
        pc.on('connect', () => {
            pc.send(`${this.peerId}${PeerService.OPEN_CNTS_AS_INIT}${JSON.stringify(this.peers)}`);
            console.log('DataChannel connected, emitting peer list');

            this.updateObservable();
        })
    }

    /**
     * Triggered on DataChannel data reception
     * @param pc
     */
    private registerActions(pc: Peer.Instance) {

        // As a client initiator we should also have just received the peers list from the server
        // At that point it should be filled with our peerId and all the peerIds of the client we've just connected to
        // but we don't want to send it to our newly connected peers since they already have data channels
        // to us, the session initiator and to each other
        pc.on('connect', () => {
            console.log('DataChannel connected');
        });

        /**
         * Step 6
         */
        pc.on('data', async data => {
            // String buffer back to string
            data = new TextDecoder("utf-8").decode(data);

            console.log('Received :' + data);

            const senderId = await this.checkForCommand(data);
            this.peerConnections.set(senderId, pc);
            this.updateObservable();
        })
    }

    /**
     * Generates offers for each existing session clients in order to establish rtc connection
     * @param peers
     */
    private async createExistingPeersOffers(peers: { [key: string]: any }) {
        return Object.fromEntries(await Promise.all(
            Object.entries(peers)
                .filter((set: [string, string]) => set[0] !== this.peerId)
                .map(async (set: [string, Peer.SignalData]) => {

                    let peerConnection = new Peer({
                        initiator: true,
                        trickle: false
                    });

                    let signalingData = await this.getSignalingData(peerConnection);
                    set.splice(1, 1, signalingData);

                    console.log('Storing peerConnection with id : ', set[0]);

                    // Storage of inter-client owner side connections
                    this.peerConnections.set(set[0], peerConnection);
                    this.updateObservable();
                    return set
                })
            )
        )
    }

    /**
     * Checks a string for command and runs it
     * @param data
     */
    private async checkForCommand(data: string): Promise<string> {

        const senderId: string = data.substr(0, 10);

        switch (data.substr(10, 20)) {
            case PeerService.OPEN_CNTS_AS_INIT:
                if (!this.server)
                    throw new Error('Server is unreachable');

                const peers = JSON.parse(data.substr(30));

                if (Object.entries(peers).length) {
                    console.log('Emitting `initiator-offers` from ', this.peerId);
                    const offers = await this.createExistingPeersOffers(peers);
                    this.server.emit('initiator-offers', offers, this.peerId, this.roomId);
                }
                break;
        }

        return new Promise(resolve => resolve(senderId));
    }

    /**
     * Getter on signaling data as a promise rather than an callback
     * @param peerConnection
     */
    private async getSignalingData(peerConnection: SimplePeer.Instance) {
        return new Promise<SimplePeer.SignalData>((resolve, reject) => {
            try {
                if (peerConnection)
                    peerConnection.on('signal', data => resolve(data))
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Step 2bis
     * @param request
     */
    private onOfferRequest(request: JoinRequest) {
        console.log('Received `offer-request`');

        delete this.currentPeerConnection;
        this.currentPeerConnection = new Peer({
            initiator: true,
            trickle: false
        });

        this.currentPeerConnection.on('signal', data => {
            this.signalingData = data;

            if (this.server)
                this.server.emit('offer-response', request, this.signalingData);
        });
        console.log('Emitting `offer-response`');
    }

    /**
     * Step 5
     * @param data
     * @param peerId
     * @param sessionInitiator
     * @param emitterPeerId
     */
    private onClientOffer(data: ClientOffer, peerId: string, sessionInitiator: boolean, emitterPeerId: string) {

        console.log('Receiving `client-offer`', data, ', sessionInitiator: ', sessionInitiator);

        if (sessionInitiator) {
            this.registerInitiatorActions(this.currentPeerConnection);
            this.registerActions(this.currentPeerConnection);
            this.peerConnections.set(emitterPeerId, this.currentPeerConnection);
            this.updateObservable();
        }

        if (peerId) {
            const peerConnection = this.peerConnections.get(emitterPeerId);
            this.updateObservable();

            console.log('Target peerConnection for peerId : ', emitterPeerId, peerConnection);

            if (peerConnection) {
                this.registerActions(peerConnection);
                this.currentPeerConnection = peerConnection;
            }
        }

        this.currentPeerConnection.signal(data.offer);

        this.peers = data.peers;
    }

    /**
     * Updates the subject value for subscribed consumers
     */
    private updateObservable() {
        subscriber.next(this._peerConnections)
    }

    get peerConnections(): Map<string, SimplePeer.Instance> {
        return this._peerConnections;
    }
}
