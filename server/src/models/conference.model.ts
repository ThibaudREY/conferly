import { Socket } from "socket.io";

export default class Conference {

    private _roomId: string;
    private _offer: any;
    private _socketInitiator: Socket;
    private _peers: Map<string, string>;

    constructor(roomId: string, socketInitiator: Socket) {
        this._roomId = roomId;
        this._socketInitiator = socketInitiator;
        this._peers = new Map<string, string>();
    }

    public get roomId(): string {
        return this._roomId;
    }
    public set roomId(value: string) {
        this._roomId = value;
    }

    public get offer(): any {
        return this._offer;
    }
    public set offer(value: any) {
        this._offer = value;
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