export default class JoinRequest {

    private _roomId: string;
    private _peerId: string;

    constructor(roomId: string, peerId: string) {
        this._roomId = roomId;
        this._peerId = peerId;
    }

    public get roomId(): string {
        return this._roomId;
    }
    public set roomId(value: string) {
        this._roomId = value;
    }

    public get peerId(): string {
        return this._peerId;
    }
    public set peerId(value: string) {
        this._peerId = value;
    }
}