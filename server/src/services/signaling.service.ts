import "reflect-metadata";
import { Service } from "typedi";
import Conference from "../models/conference.model";
import { Socket } from "socket.io";
import JoinRequest from "../models/join-request.model";
import JoinAcknoledgement from "../models/join-ack.model";
import SimplePeer = require("simple-peer");
import { logger } from './logger.service';
import SocketJoinException from "../exceptions/socket-join.exception";
import RoomAlreadyExistException from "../exceptions/room-exist.exception";
import RoomNotFoundException from "../exceptions/room-not-found.exception";
import PeerNotFoundException from "../exceptions/peer-not-found.exception";

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
     * @throws {SocketJoinException, RoomAlreadyExistException}
     */
    public createRoom(socket: Socket, conf: Conference): void {

        const exist = this.conferences.has(conf.roomId);

        if (!exist) {
            const currentSocket = socket.join(conf.roomId, (err: any) => {
                if (err) {
                    socket.to(socket.id).emit('server-error', `Error in creating room: ${err}`);
                    throw new SocketJoinException(`Error in creating room: ${err}`);
                }
            });
            const conference = new Conference(conf.roomId, currentSocket);
            this.conferences.set(conf.roomId, conference);
        } else {
            socket.to(socket.id).emit('server-error', `Error room already exist with id: ${conf.roomId}`);
            throw new RoomAlreadyExistException(`Error room already exist with id: ${conf.roomId}`);
        }
    }

    /**
     * Handle join-request & offer-request step
     * Transit webrtc offer to initiator
     * @param {Socket} socket
     * @param {JoinRequest} joinRequest
     * @returns {void}
     * @throws {RoomNotFoundException}
     */
    public onJoinRequest(socket: Socket, joinRequest: JoinRequest): void {

        const conference = this.conferences.get(joinRequest.roomId);

        if (!conference) {
            socket.to(socket.id).emit('server-error', `Error room not found with id: ${joinRequest.roomId}`);
            throw new RoomNotFoundException(`Error room not found with id: ${joinRequest.roomId}`);
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
     * @throws {RoomNotFoundException, PeerNotFoundException}
     */
    public onOfferResponse(socket: Socket, joinRequest: JoinRequest, signalingData: SimplePeer.SignalData): void {

        const conference = this.conferences.get(joinRequest.roomId);

        if (!conference) {
            throw new RoomNotFoundException(`Error room not found with id: ${joinRequest.roomId}`);

        } else {
            const peerSocket = conference.peers.get(joinRequest.peerId);

            if (peerSocket) {
                socket.to(peerSocket).emit('join-response', signalingData);
                logger.debug('Emitted join-response with : ', signalingData);
            } else {
                throw new PeerNotFoundException(`Error peer not found with id: ${joinRequest.peerId}`);
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
     * @throws {RoomNotFoundException}
     */
    public onJoinAck(socket: SocketIO.Socket, { offer, peerId, roomId }: JoinAcknoledgement, emitterPeerId: string): void {

        const currentConference = this.conferences.get(roomId);

        if (!currentConference)
            throw new RoomNotFoundException(`Error room not found with id: ${roomId}`);

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
     * @throws {RoomNotFoundException}
     */
    public onInitiatorOffers(socket: SocketIO.Socket, data: any, peerId: string, roomId: string): void {

        const currentConference = this.conferences.get(roomId);

        if (!currentConference)
            throw new RoomNotFoundException(`Error room not found with id: ${roomId}`);

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
