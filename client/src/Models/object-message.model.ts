import { MessageType } from '../Enums/message-type.enum';
import ChatMessage     from './chat-message.model';

export default class ObjectMessage extends ChatMessage {

    public senderId: string;
    public username: string;
    public timestamp: number;
    public filename: string;
    public base64: string;
    public size: number;
    public type: MessageType;
    public message: string;

    /**
     * Object related message
     * @param senderId
     * @param username
     * @param filename
     * @param base64
     * @param size
     * @param type
     */
    constructor(senderId: string, username: string, filename: string, base64: string, size: number, type: MessageType) {
        super(senderId, username, '', MessageType.FILE_MESSAGE);
        this.senderId = senderId;
        this.username = username;
        this.filename = filename;
        this.base64 = base64;
        this.timestamp = + new Date();
        this.size = size;
        this.type = type;
        this.message = '';
    }

}
