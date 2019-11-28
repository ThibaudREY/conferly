import ChatMessage                     from "../../Models/chat-message.model";
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable }                  from "injection-js";
import ObjectMessage                   from '../../Models/object-message.model';

@Injectable()
export default class ChatManagerService {

    private _messages: Array<ChatMessage|ObjectMessage>;
    private _messagesObservable: BehaviorSubject<Array<ChatMessage|ObjectMessage>>;

    constructor() {
        this._messages = [];
        this._messagesObservable = new BehaviorSubject<Array<ChatMessage|ObjectMessage>>([]);
    }

    public addMessage(chatMessage: ChatMessage | ObjectMessage): void {
        this._messages.push(chatMessage);
        this._messagesObservable.next(this._messages);
    }

    get messages(): Observable<Array<ChatMessage|ObjectMessage>> {
        return this._messagesObservable.asObservable();
    }
}
