import { MessageType } from "../Enums/message-type.enum";

export default class ChatMessage {

    public senderId: string;
    public username: string;
    public message: string;
    public timestamp: number;
    public type: MessageType;

    /**
     * @constructor
     * @param senderId the id of the sender
     * @param message message
     */
    constructor(senderId: string, username: string, message: string, type: MessageType) {
        this.senderId = senderId;
        this.username = username;
        this.message = message;
        this.timestamp = + new Date();
        this.type = type;
    }
}