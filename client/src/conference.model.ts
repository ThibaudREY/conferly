export default class Conference {

    private roomId: string;
    private offer: any;

    constructor(roomId: string, offer: any) {
        this.roomId = roomId;
        this.offer = offer;
    }
}
