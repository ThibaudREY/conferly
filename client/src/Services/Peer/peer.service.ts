import JoinRequest from '../../Models/join-request.model';
import Conference from '../../Models/conference.model';
import uid from 'uid-safe';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import ClientOffer from '../../Models/client-offer.model';
import SimplePeer from 'simple-peer';
import JoinAcknowledgement from '../../Models/join-acknowledgement.model';
import { BehaviorSubject } from 'rxjs';
import { Commands } from '../Command/Commands/commands.enum';
import { getSignalingData } from './utils';
import CommandService from '../Command/command.service';
import openConnectionsAsInitiator from '../Command/Commands/openConnectionsAsInitiator';
import onJoinMessage from '../Command/Commands/onJoinMessage';
import { error } from '../error-modal.service';
import { Injectable } from 'injection-js';
import ChatManagerService from '../Manager/ChatManagerService';
import { injector } from '../..';
import ChatMessage from '../../Models/chat-message.model';
import { MessageType } from '../../Enums/message-type.enum';

export const subscriber = new BehaviorSubject(new Map());

@Injectable()
export default class PeerService {

    private currentPeerConnection: Peer.Instance; // TODO: Maybe need a stack (if initiator is handling several processes at once

    private _peerId: string = '';

    private peers: { [key: string]: string } = {};

    private _roomId: string = '';

    private signalingData: any;

    private _peerConnections: Map<string, Peer.Instance>;

    private readonly _server: SocketIOClient.Socket;

    private readonly _chatManagerService: ChatManagerService;

    constructor() {
        this._peerConnections = new Map<string, Peer.Instance>();
        this.currentPeerConnection = new Peer();
        this._server = io(process.env.REACT_APP_SIGNALING_SERVER as string);
        this._chatManagerService = injector.get(ChatManagerService);
        CommandService.register(Commands.OPEN_CNTS_AS_INIT, openConnectionsAsInitiator);
        CommandService.register(Commands.JOIN_MESSAGE, onJoinMessage);

        this.registerWsActions();
    }

    private registerWsActions() {
        if (this._server) {
            this.server.on('connect_error', () => { error.next({ show: true, message: 'Network is unreachable', acknowledgable: false }) });
            this.server.on('connect', () => { error.next({ show: false, message: '', acknowledgable: false }) });
            this.server.on('server-error', (message: string) => { error.next({ message: message, show: true, acknowledgable: false }) });
            this.server.on('leaving', (peerId: string) => this.onLeaving(peerId));
            this.server.on('offer-request', (request: JoinRequest) => this.onOfferRequest(request));
            this.server.on('client-offer', (data: ClientOffer, peerId: string, sessionInitiator: boolean, emitterPeerId: string) => this.onClientOffer(data, peerId, sessionInitiator, emitterPeerId));
        }
    }

    public async createRoom(): Promise<string> {
        this._peerId = uid.sync(7);
        this._roomId = uid.sync(7);
        const conference = new Conference(this.peerId, this.roomId);

        if (!this._server)
            throw new Error('Server is unreachable');

        this._server.emit('create', await conference);
        return this._roomId;
    }

    public async joinRoom(roomId: string) {
        this._roomId = roomId;
        if (this._server) {
            this._peerId = uid.sync(7);
            this._server.emit('join-request', new JoinRequest(roomId, this._peerId));
            await this._server.on('join-response', (offer: SimplePeer.SignalData, peerId: string) => this.onJoinResponse(offer, peerId, roomId))
        }
    }

    private async onJoinResponse(offer: SimplePeer.SignalData, peerId: string, roomId: string) {
        this.currentPeerConnection = new Peer({
            initiator: false,
            trickle: false
        });
        this.registerActions(this.currentPeerConnection);
        this.currentPeerConnection.signal(offer);
        const signalingData = await getSignalingData(this.currentPeerConnection);

        if (this._server) {
            this._server.emit('join-ack', new JoinAcknowledgement(await signalingData, roomId, peerId), this._peerId);
            if (peerId) {
                this.peerConnections.set(peerId, this.currentPeerConnection);
                this.updateObservable();
            }
        }
    }

    private registerInitiatorActions(pc: Peer.Instance) {
        pc.on('connect', () => {

            // TEMP FIX: DO NOT PUSH THIS ON PRODUCTION
            setTimeout(() => {
                const message: ChatMessage = new ChatMessage(this.peerId, `Welcome`, MessageType.STATUS_MESSAGE);
                pc.send(`${this._peerId}${Commands.JOIN_MESSAGE}${JSON.stringify(message)}`);
            }, 10000);

            pc.send(`${this._peerId}${Commands.OPEN_CNTS_AS_INIT}${JSON.stringify(this.peers)}`);
            this.updateObservable();
        })
    }

    private registerActions(pc: Peer.Instance) {

        pc.on('connect', () => {
            const helloMessage = new ChatMessage(this.peerId, `${this.peerId} has joined the conference`, MessageType.STATUS_MESSAGE);
            pc.send(`${this.peerId}${Commands.JOIN_MESSAGE}${JSON.stringify(helloMessage)}`);
        });

        pc.on('data', async data => {
            data = new TextDecoder("utf-8").decode(data);

            const senderId = await CommandService.parse(this, data);
            this.peerConnections.set(senderId, pc);
            this.updateObservable();
        })
    }

    private async onOfferRequest(request: JoinRequest) {
        delete this.currentPeerConnection;
        this.currentPeerConnection = new Peer({
            initiator: true,
            trickle: false
        });

        this.signalingData = await getSignalingData(this.currentPeerConnection);
        if (this._server)
            this._server.emit('offer-response', request, this.signalingData);
    }

    private onClientOffer(data: ClientOffer, peerId: string, sessionInitiator: boolean, emitterPeerId: string) {
        if (sessionInitiator) {
            this.registerInitiatorActions(this.currentPeerConnection);
            this.registerActions(this.currentPeerConnection);
            this.peerConnections.set(emitterPeerId, this.currentPeerConnection);
        }

        if (peerId) {
            const peerConnection = this.peerConnections.get(emitterPeerId);
            if (peerConnection) {
                this.registerActions(peerConnection);
                this.currentPeerConnection = peerConnection;
            }
        }
        this.updateObservable();
        this.currentPeerConnection.signal(data.offer);
        this.peers = data.peers;
    }

    private onLeaving(peerId: string) {
        const pc = new Map<string, SimplePeer.Instance>();
        for (let entry of this.peerConnections.entries()) {
            if (entry[0] !== peerId)
                pc.set(entry[0], entry[1]);
        }
        this.peerConnections = pc;
        const byeMessage = new ChatMessage(peerId, `${peerId} has left the conference`, MessageType.STATUS_MESSAGE);
        this.currentPeerConnection.send(`${peerId}${Commands.JOIN_MESSAGE}${JSON.stringify(byeMessage)}`);
        this._chatManagerService.addMessage(byeMessage);
        this.updateObservable();
    }

    public updateObservable() {
        subscriber.next(this._peerConnections)
    }

    get peerConnections(): Map<string, SimplePeer.Instance> {
        return this._peerConnections;
    }

    set peerConnections(value: Map<string, SimplePeer.Instance>) {
        this._peerConnections = value;
    }

    get peerId(): string {
        return this._peerId;
    }

    set peerId(value: string) {
        this._peerId = value;
    }

    get server(): SocketIOClient.Socket {
        return this._server;
    }

    get roomId(): string {
        return this._roomId;
    }

    set roomId(value: string) {
        this._roomId = value;
    }


}
