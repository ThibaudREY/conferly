export default class JoinRequest {

    public roomId: string;
    public peerId: string;

    constructor(roomId: string, peerId: string) {
        this.roomId = roomId;
        this.peerId = peerId;
    }
}
