import JoinRequest from '../../Models/join-request.model';
import Conference from '../../Models/conference.model';
import uid from 'uid-safe';
import Peer from 'simple-peer';
import SimplePeer from 'simple-peer';
import io from 'socket.io-client';
import freeice from 'freeice';
import ClientOffer from '../../Models/client-offer.model';
import JoinAcknowledgement from '../../Models/join-acknowledgement.model';
import { BehaviorSubject } from 'rxjs';
import { Commands } from '../Command/Commands/commands.enum';
import { getSignalingData } from './utils';
import CommandService from '../Command/command.service';
import openConnectionsAsInitiator from '../Command/Commands/openConnectionsAsInitiator';
import { error } from '../error-modal.service';
import { Injectable } from 'injection-js';
import StreamManagerService from '../Manager/stream-manager.service';
import { injector } from '../../index';
import ChatManagerService from '../Manager/ChatManagerService';
import onJoinMessage from '../Command/Commands/onJoinMessage';
import ChatMessage from '../../Models/chat-message.model';
import { MessageType } from '../../Enums/message-type.enum';
import { splashSreen } from '../../Components/Splash';
import { User } from '../../Models/user.model';
import { board } from '../../Components/Meeting/Board';
import AppService, { appServices } from '../Manager/app-service.service';
import { getAllServices } from '../Command/Commands/appServicesCommands';

export const peers = new BehaviorSubject(new Map());

@Injectable()
export default class PeerService {

    private currentPeerConnection: Peer.Instance; // TODO: Maybe need a stack (if initiator is handling several processes at once

    private _peerId: string = '';

    private _username: string = '';

    private peers: { [key: string]: string } = {};

    private _roomId: string = '';

    private signalingData: any;

    private _peerConnections: Map<string, { instance: Peer.Instance, user: User }>;

    private readonly _server: SocketIOClient.Socket;

    private readonly _chatManagerService: ChatManagerService;

    private commandService: CommandService = injector.get(CommandService);

    private streamManagerService: StreamManagerService = injector.get(StreamManagerService);

    private appService: AppService = injector.get(AppService);

    constructor() {
        this._peerConnections = new Map<string, { instance: Peer.Instance, user: User }>();
        this.currentPeerConnection = new Peer();
        this._server = io(process.env.REACT_APP_SIGNALING_SERVER as string);
        this._chatManagerService = injector.get(ChatManagerService);
        this.commandService.register(Commands.OPEN_CNTS_AS_INIT, openConnectionsAsInitiator);
        this.commandService.register(Commands.JOIN_MESSAGE, onJoinMessage);
        this.commandService.register(Commands.SERVICE_ALL, getAllServices);

        this.registerWsActions();
    }

    private registerWsActions() {
        if (this._server) {
            this.server.on('connect_error', () => {
                error.next({ show: true, message: 'Network is unreachable', acknowledgable: false })
            });
            this.server.on('connect', () => {
                error.next({ show: false, message: '', acknowledgable: false })
            });
            this.server.on('server-error', async (message: string) => {
                this.streamManagerService.stopMediaStream(await this.streamManagerService.getCurrentPeerMediaStream());
                setTimeout(() => error.next({ message: message, show: true, acknowledgable: false }));
            });
            this.server.on('leaving', (peerId: string) => this.onLeaving(peerId));
            this.server.on('offer-request', (request: JoinRequest) => this.onOfferRequest(request));
            this.server.on('client-offer', (data: ClientOffer, peerId: string, sessionInitiator: boolean, emitterPeerId: string) => this.onClientOffer(data, peerId, sessionInitiator, emitterPeerId));
        }
    }

    public async createRoom(): Promise<string> {
        this.peerId = uid.sync(7);
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
            this.peerId = uid.sync(7);
            this._server.emit('join-request', new JoinRequest(roomId, this.peerId));

            splashSreen.next({ show: true, message: 'Requesting access' });

            await this._server.on('join-response', (offer: SimplePeer.SignalData, peerId: string, initiatorPeerId: string) => this.onJoinResponse(offer, peerId, roomId, initiatorPeerId))
        }
    }

    private async onJoinResponse(offer: SimplePeer.SignalData, peerId: string, roomId: string, initiatorPeerId: string) {

        if (this.peerConnections.size === 0) {
            splashSreen.next({ show: true, message: 'Receiving response access' });
        }

        this.currentPeerConnection = new Peer({
            initiator: false,
            trickle: false,
            stream: await this.streamManagerService.getCurrentPeerMediaStream(),
            config: { iceServers: freeice() }
        });

        this.currentPeerConnection.on('stream', (stream: Promise<MediaStream>) => {

            if (peerId) {
                this.streamManagerService.subscribePeerStream(peerId, stream);
            } else {
                this.streamManagerService.subscribePeerStream(initiatorPeerId, stream);
            }
        });

        this.registerActions(this.currentPeerConnection);
        this.currentPeerConnection.signal(offer);
        const signalingData = await getSignalingData(this.currentPeerConnection);

        if (this._server) {

            if (this.peerConnections.size === 0) {
                splashSreen.next({ show: true, message: 'Joining session' });
            }

            this._server.emit('join-ack', new JoinAcknowledgement(await signalingData, roomId, peerId), this.peerId);

            if (peerId) {
                this.peerConnections.set(peerId, { instance: this.currentPeerConnection, user: new User() });
                this.updateObservable();
            }
        }
    }

    private registerInitiatorActions(pc: Peer.Instance) {
        pc.once('connect', () => {

            // TEMP FIX: DO NOT PUSH THIS ON PRODUCTION
            setTimeout(() => {
                const message: ChatMessage = new ChatMessage(this.peerId, this.username, `Welcome`, MessageType.STATUS_MESSAGE);
                this.commandService.send(pc, this._peerId, Commands.WELCOME_MESSAGE, JSON.stringify(message));
                console.log(appServices);
                this.commandService.send(pc, this._peerId, Commands.SERVICE_ALL, JSON.stringify(Array.from(appServices.value.entries())));
                this.commandService.broadcast(Commands.BOARD_UPDATE, board.value.getSaveData())
            }, 10000);

            this.commandService.send(pc, this._peerId, Commands.OPEN_CNTS_AS_INIT, JSON.stringify(this.peers));
            this.updateObservable();
        });
    }

    private registerActions(pc: Peer.Instance) {

        pc.once('connect', () => {
            const helloMessage = new ChatMessage(this.peerId, this.username, `${this.username} has joined the conference`, MessageType.STATUS_MESSAGE);
            this.commandService.send(pc, this.peerId, Commands.JOIN_MESSAGE, JSON.stringify(helloMessage));
        });

        pc.on('data', async data => {

            if (!(this.currentPeerConnection as any).initiator && this.peerConnections.size === 0) {
                splashSreen.next({ show: true, message: 'Connecting to existing peers' });
            }

            data = new TextDecoder("utf-8").decode(data);

            const senderId = await this.commandService.parse(this, data);
            let user = new User();
            if (this.peerConnections.get(senderId)) {
                user = this.peerConnections.get(senderId)!.user;
            }
            this.peerConnections.set(senderId, { instance: pc, user });
            this.updateObservable();
        })
    }

    private async onOfferRequest(request: JoinRequest) {

        delete this.currentPeerConnection;
        this.currentPeerConnection = new Peer({
            initiator: true,
            trickle: false,
            stream: await this.streamManagerService.getCurrentPeerMediaStream(),
            config: { iceServers: freeice() }
        });

        this.currentPeerConnection.on('stream', (stream: Promise<MediaStream>) => {
            this.streamManagerService.subscribePeerStream(request.peerId, stream);
        })

        this.signalingData = await getSignalingData(this.currentPeerConnection);
        if (this._server)
            this._server.emit('offer-response', request, this.signalingData);
    }

    private onClientOffer(data: ClientOffer, peerId: string, sessionInitiator: boolean, emitterPeerId: string) {
        if (sessionInitiator) {
            this.registerInitiatorActions(this.currentPeerConnection);
            this.registerActions(this.currentPeerConnection);
            this.peerConnections.set(emitterPeerId, { instance: this.currentPeerConnection, user: new User() });
        }

        if (peerId) {
            const peerConnection = this.peerConnections.get(emitterPeerId);
            if (peerConnection) {
                this.registerActions(peerConnection.instance);
                this.currentPeerConnection = peerConnection.instance;
            }
        }
        this.updateObservable();
        this.currentPeerConnection.signal(data.offer);
        this.peers = data.peers;
    }

    private async onLeaving(peerId: string) {
        const username = this.peerConnections.get(peerId)!.user.username;
        const byeMessage = new ChatMessage(peerId, peerId, `${username} has left the conference`, MessageType.STATUS_MESSAGE);
        this.commandService.send(this.currentPeerConnection, peerId, Commands.JOIN_MESSAGE, JSON.stringify(byeMessage));
        this._chatManagerService.addMessage(byeMessage);

        const peerStream = await this.streamManagerService.streams.get(peerId);
        if (peerStream) {
            this.streamManagerService.stopMediaStream(peerStream);
            this.streamManagerService.unsubscribePeerStream(peerId);
        }

        this.peerConnections.get(peerId)!.instance.destroy();
        const pc = new Map<string, { instance: SimplePeer.Instance, user: User }>();
        for (let entry of this.peerConnections.entries()) {
            if (entry[0] !== peerId)
                pc.set(entry[0], entry[1]);
        }

        this.peerConnections = pc;
        this.updateObservable();
    }

    public updateObservable() {
        peers.next(this._peerConnections)
    }

    get peerConnections(): Map<string, { instance: SimplePeer.Instance, user: User }> {
        return this._peerConnections;
    }

    set peerConnections(value: Map<string, { instance: SimplePeer.Instance, user: User }>) {
        this._peerConnections = value;
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

    get username(): string {
        return this._username;
    }

    set username(value: string) {
        this._username = value;
    }

    get peerId(): string {
        return this._peerId;
    }

    set peerId(value: string) {
        this._peerId = value;
    }
}
