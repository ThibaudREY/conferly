import "reflect-metadata";
import { Service }        from "typedi";
import Conference         from "../models/conference.model";
import { Socket }         from "socket.io";
import JoinRequest        from "../models/join-request.model";
import JoinAcknoledgement from "../models/join-ack.model";
import SimplePeer = require("simple-peer");
import { logger }         from './logger.service';

type Peer = { [index: string]: string }

@Service()
export default class SignalingService {

    private conferences: Map<string, Conference>;

    /**
     * @constructor
     */
    constructor() {
        this.conferences = new Map<string, Conference>();
    }

    /**
     * Initiator's room creation
     * @param {Socket} socket
     * @param {Conference} conf
     * @returns {void}
     */
    public createRoom(socket: Socket, conf: Conference): void {

        const exist = this.conferences.has(conf.roomId);

        if (!exist) {
            const currentSocket = socket.join(conf.roomId);
            const conference = new Conference(conf.roomId, currentSocket);
            this.conferences.set(conf.roomId, conference);
        } else {
            throw new Error('Room already exist');
        }
    }

    /**
     * Handle join-request & offer-request step
     * Transit webrtc offer to initiator
     * @param {Socket} socket
     * @param {JoinRequest} joinRequest
     * @returns {void}
     */
    public onJoinRequest(socket: Socket, joinRequest: JoinRequest): void {

        const conference = this.conferences.get(joinRequest.roomId);

        if (!conference) {
            throw new Error('Room doesnt exist');
        } else {
            conference.peers.set(joinRequest.peerId, socket.id);
            socket.to(conference.socketInitiator.id).emit('offer-request', joinRequest);
            logger.debug('Emitted offer-request with : ', joinRequest);
        }
    }

    /**
     * Handle offer-response & join-response step
     * Receive & Emit signaling data to requester
     * @param {Socket} socket
     * @param {JoinRequest} joinRequest
     * @param {SimplePeer.SignalData} signalingData
     * @returns {void}
     */
    public onOfferResponse(socket: Socket, joinRequest: JoinRequest, signalingData: SimplePeer.SignalData): void {

        const conference = this.conferences.get(joinRequest.roomId);

        if (!conference) {
            throw new Error('Room doesnt exist');
        } else {

            const peerSocket = conference.peers.get(joinRequest.peerId);
            if (peerSocket) {
                socket.to(peerSocket).emit('join-response', signalingData);
                logger.debug('Emitted join-response with : ', signalingData);
            }
        }
    }

    /**
     * Handle join-acknoledgement & client-offer step
     * Receive and Transit webRTC offer to session initiator or a new peer
     * @param {Socket} socket
     * @param {JoinAcknoledgement} joinAck
     * @param {string} emitterPeerId
     * @returns {void}
     */
    public onJoinAck(socket: SocketIO.Socket, { offer, peerId, roomId }: JoinAcknoledgement, emitterPeerId: string): void {

        const currentConference = this.conferences.get(roomId);

        if (!currentConference)
            throw new Error('Room doesnt exist');

        const dest = peerId ? currentConference.peers.get(peerId) as string : currentConference.socketInitiator.id;
        const sessionInitiator = !peerId;

        const peers = this.getPeers(currentConference.peers);
        socket.to(dest).emit('client-offer', { offer: offer, peers }, peerId, sessionInitiator, emitterPeerId);
        logger.debug('Emitted client-offer with : ', { offer: offer, peers }, peerId, sessionInitiator, emitterPeerId);
    }

    /**
     * Handle initiator-offer & join-response step
     * Transit to a peer, peers from the conference with their offer
     * @param {Socket} socket
     * @param {any} data
     * @param {string} peerId
     * @param {string} roomId
     * @returns {void}
     */
    public onInitiatorOffers(socket: SocketIO.Socket, data: any, peerId: string, roomId: string): void {

        const currentConference = this.conferences.get(roomId);

        if (!currentConference)
            throw new Error('Room doesnt exist');

        Object.entries(data).forEach((set: [string, any]) => {
            const peerSocket = currentConference.peers.get(set[0]);
            if (peerSocket) {
                socket.to(peerSocket).emit('join-response', set[1], peerId);
                logger.debug('Emitted join-request with : ', set[1], peerId)
            }
        });

    }

    /**
     * Format to Peer Object
     * @param {Map<string,string>} peers
     * @returns {Peer}
     */
    private getPeers(peers: Map<string, string>): Peer {
        let peersToReturn: Peer = {};

        peers.forEach((value: string, index: string) => {
            peersToReturn[index] = value;
        });

        return peersToReturn;
    }
}
