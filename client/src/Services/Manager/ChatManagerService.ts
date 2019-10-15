import ChatMessage from "../../Models/chat-message.model";
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from "injection-js";

@Injectable()
export default class ChatManagerService {

    private _messages: ChatMessage[];
    private _messagesObservable: BehaviorSubject<ChatMessage[]>;

    constructor() {
        this._messages = [];
        this._messagesObservable = new BehaviorSubject<ChatMessage[]>([]);
    }

    public addMessage(chatMessage: ChatMessage): void {
        this._messages.push(chatMessage);
        this._messagesObservable.next(this._messages);
    }

    get messages(): Observable<ChatMessage[]> {
        return this._messagesObservable.asObservable();
    }
}