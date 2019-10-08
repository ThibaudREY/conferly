import { Socket } from "socket.io";

export default class Conference {

    private _roomId: string;
    private _initiatorPeerId: string;
    private _socketInitiator: Socket;
    private _peers: Map<string, string>;

    constructor(roomId: string, initiatorPeerId: string, socketInitiator: Socket) {
        this._roomId = roomId;
        this._initiatorPeerId = initiatorPeerId;
        this._socketInitiator = socketInitiator;
        this._peers = new Map<string, string>();
    }

    public get roomId(): string {
        return this._roomId;
    }
    public set roomId(value: string) {
        this._roomId = value;
    }

    public get initiatorPeerId(): string {
        return this._initiatorPeerId;
    }
    public set initiatorPeerId(value: string) {
        this._initiatorPeerId = value;
    }

    public get socketInitiator(): Socket {
        return this._socketInitiator;
    }
    public set socketInitiator(value: Socket) {
        this._socketInitiator = value;
    }

    public get peers(): Map<string, string> {
        return this._peers;
    }
}