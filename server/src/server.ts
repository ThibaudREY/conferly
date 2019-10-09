import express                  from "express";
import socketIo, { Socket }     from 'socket.io';
import { Server, createServer } from "http";
import SimplePeer               from "simple-peer";
import SignalingService         from "./services/signaling.service";
import Container                from "typedi";
import Conference               from "./models/conference.model";
import JoinRequest              from "./models/join-request.model";
import JoinAcknoledgement       from "./models/join-ack.model";
import { logger }               from './services/logger.service';

export class SignalingServer {

    private readonly _port: string | number;
    private _app: Express.Application;
    private _server: Server;
    private _io: SocketIO.Server;

    /**
     * @constructor
     * @param port port to listen
     */
    constructor(port: string | number) {
        this._port = port;
        this._app = express();
        this._server = createServer(this._app);
        this._io = socketIo(this._server);
        this.handlePeers();
        this.listen();
    }

    /**
     * Handle webRTC offers using websockets
     * @returns {void}
     */
    private handlePeers(): void {
        const signalingService: SignalingService = Container.get(SignalingService);
        this._io.on('connection', (socket: Socket) => {

            // STEP 1
            socket.on('create', (conf: Conference) => {
                logger.debug('Received create with : ', conf);
                signalingService.createRoom(socket, conf);
            });

            // STEP 2
            socket.on('join-request', (joinRequest: JoinRequest) => {
                logger.debug('Received join-request with : ', joinRequest);
                signalingService.onJoinRequest(socket, joinRequest);
            });

            // STEP 3
            socket.on('offer-response', (joinRequest: JoinRequest, signalingData: SimplePeer.SignalData) => {
                logger.debug('Received offer-response with : ', joinRequest, signalingData);
                signalingService.onOfferResponse(socket, joinRequest, signalingData);
            });

            // STEP 4
            socket.on('join-ack', (joinAck: JoinAcknoledgement, emitterPeerId: string) => {
                logger.debug('Received join-ack with : ', joinAck, emitterPeerId);
                signalingService.onJoinAck(socket, joinAck, emitterPeerId);
            });

            // STEP 5
            socket.on('initiator-offers', (data: any, peerId: string, roomId: string) => {
                logger.debug('Received initiator-offers with : ', data, peerId, roomId);
                signalingService.onInitiatorOffers(socket, data, peerId, roomId);
            });
        });
    }

    /**
     * Run server
     * @returns {void}
     */
    private listen(): void {
        this._server.listen(this._port, () => {
            logger.info('Running server on port %s', this._port);
        });

    }
}
