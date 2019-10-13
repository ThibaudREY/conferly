export default class Conference {

    public initiatorPeerId: string;
    public roomId: string;
    public peers: Map<string, SocketIOClient.Socket>;

    constructor(initiatorPeerId: string, roomId: string, offer?: any) {
        this.initiatorPeerId = initiatorPeerId;
        this.roomId = roomId;
        this.peers = new Map<string, SocketIOClient.Socket>();
    }
}
