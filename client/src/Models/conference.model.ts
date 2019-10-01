export default class Conference {

    public roomId: string;
    public peers: Map<string, SocketIOClient.Socket>;

    constructor(roomId: string, offer?: any) {
        this.roomId = roomId;
        this.peers = new Map<string, SocketIOClient.Socket>();
    }
}
