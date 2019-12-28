import { Injectable } from 'injection-js';
import { BehaviorSubject } from 'rxjs';
import { toast } from 'react-toastify';
import ChatManagerService from './ChatManagerService';
import { injector } from '../..';
import ChatMessage from '../../Models/chat-message.model';
import { MessageType } from '../../Enums/message-type.enum';

export const appServices = new BehaviorSubject(new Map<string, string>());

@Injectable()
export default class AppService {

    private _services: Map<string, string>;
    private _chatService: ChatManagerService;

    /**
     * @constructor
     */
    constructor() {
        this._services = new Map<string, string>();
        this._chatService = injector.get(ChatManagerService);
    }

    public getSavedServices(): Map<string, string> {

        const saved = new Map<string, string>();
        console.log('ho');

        for (let i = 0; i < localStorage.length; i++) {
            console.log('ho');
            const key: string | null = localStorage.key(i);
            const token: string | null = localStorage.getItem(key!);
            if (key && token) {
                saved.set(key, token);
            }
        }
        return saved;
    }

    public saveOrUpdateService(appKey: string, token: string, serviceName: string) {

        if (!this.services.get(appKey)) {
            localStorage.setItem(appKey, token);
            this.services.set(appKey, token);
            this._chatService.addMessage(new ChatMessage('', '', `${serviceName} has been added to the conference`, MessageType.STATUS_MESSAGE));
            toast(`${serviceName} service added`, { type: 'success' });
        } else {
            if (token.length === 0) {
                console.log('ici');
                localStorage.removeItem(appKey);
                this.services.delete(appKey);
                this._chatService.addMessage(new ChatMessage('', '', `${serviceName} has been removed from the conference`, MessageType.STATUS_MESSAGE));
                toast(`${serviceName} service removed`, { type: 'success' });
            } else {
                console.log('ici');
                localStorage.setItem(appKey, token);
                this.services.set(appKey, token);
                this._chatService.addMessage(new ChatMessage('', '', `${serviceName} has been added to the conference`, MessageType.STATUS_MESSAGE));
                toast(`${serviceName} service updated`, { type: 'success' });
            }
        }

        appServices.next(this._services);
    }

    public setService(appKey: string, token: string) {
        this.services.set(appKey, token);
    }

    public get services(): Map<string, string> {
        return this._services;
    }


    public set services(value: Map<string, string>) {
        this._services = value;
        appServices.next(this._services);
    }
}
