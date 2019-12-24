import { Component, ChangeEvent, RefObject, createRef } from "react";
import ChatMessage from "../../../Models/chat-message.model";
import PeerService from "../../../Services/Peer/peer.service";
import React from "react";
import update from 'react-addons-update';
import { FaPaperPlane, FaCommentDots } from 'react-icons/fa';
import { Subscription } from "rxjs";
import ChatManagerService from "../../../Services/Manager/ChatManagerService";
import { IconContext } from "react-icons";
import CommandService from "../../../Services/Command/command.service";
import { Commands } from "../../../Services/Command/Commands/commands.enum";
import getDateByTimestampFromNow from '../../../Utils/date';
import { MessageType } from "../../../Enums/message-type.enum";
import { injector } from "../../..";
import './index.css';
import ObjectMessage from '../../../Models/object-message.model';
import FileIcon, { defaultStyles } from 'react-file-icon';
import * as fileSaver from 'file-saver';
import b64toBlob from 'b64-to-blob';
import { contentTypes } from '../../../Utils/contentTypes';
import { splashSreen } from "../../Splash";

interface ChatProps {
    className?: string
    onClick?: Function
}

interface ChatState {

    messages: ChatMessage[],
    message: string
}

export default class Chat extends Component<ChatProps, ChatState> {

    readonly state = {
        messages: [],
        message: '',
    };

    private peerService: PeerService;
    private chatManagerService: ChatManagerService;
    private subscription?: Subscription;
    private receivedMessage!: ChatMessage;
    private refChatHistory: RefObject<HTMLDivElement>;
    private commandService: CommandService = injector.get(CommandService);

    constructor(props: ChatProps) {
        super(props);
        this.peerService = injector.get(PeerService);
        this.chatManagerService = injector.get(ChatManagerService);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.commandService.register(Commands.RCV_MESSAGE, (self: any, data: string) => {
            this.receivedMessage = JSON.parse(data.substr(30));
            this.chatManagerService.addMessage(this.receivedMessage);
        });

        this.commandService.register(Commands.WELCOME_MESSAGE, (self: any, data: string) => {
            const senderId: string = data.substr(0, 10);
            this.receivedMessage = JSON.parse(data.substr(30));
            this.peerService.peerConnections.get(senderId)!.user.username = this.receivedMessage.username;
            this.peerService.peerConnections.get(senderId)!.user.minUsername = this.receivedMessage.username.substr(0, 3);
            this.peerService.updateObservable();

            this.chatManagerService.addMessage(this.receivedMessage);
            splashSreen.next({ show: false, message: '' });
        });

        this.commandService.register(Commands.FILE, (self: any, data: string) => {
            data = data.substr(30);
            const fileMessage = new ObjectMessage(JSON.parse(data).peerId, JSON.parse(data).username, JSON.parse(data).filename, JSON.parse(data).payload, JSON.parse(data).size, MessageType.FILE_MESSAGE);
            this.chatManagerService.addMessage(fileMessage);
        });
        this.refChatHistory = createRef<HTMLDivElement>()
    }

    async componentDidMount(): Promise<void> {

        this.subscription = this.chatManagerService.messages.subscribe(
            (messages: Array<ChatMessage | ObjectMessage>) => {
                this.setState({
                    messages: update(this.state.messages, { $set: messages })
                }, this.scrollBottom);
                this.scrollBottom();
            });
    }

    private handleChange(event: ChangeEvent<HTMLInputElement>): void {
        this.setState({
            message: event.target.value
        });
    }

    private handleSubmit(event: ChangeEvent<HTMLFormElement>): void {

        try {
            const chatMessage = new ChatMessage(this.peerService.peerId, this.peerService.username, this.state.message, MessageType.PEER_MESSAGE);
            this.chatManagerService.addMessage(chatMessage);
            this.commandService.broadcast(Commands.RCV_MESSAGE, JSON.stringify(chatMessage));
        } catch (err) {
            console.log(err, 'error');
        }

        this.setState({
            message: ""
        });

        event.preventDefault();
    }

    private scrollBottom(): void {
        if (this.refChatHistory.current)
            this.refChatHistory.current.scrollIntoView({ behavior: "smooth" });
    }

    private download(message: ObjectMessage) {
        let ext = (message as ObjectMessage).filename.split('.').pop() || '';
        let contentType = 'text/plain';
        if (Object.keys(contentTypes).includes(ext)) {
            contentTypes[ext].some(ct => {
                if (message.base64.indexOf(ct) !== -1) {
                    contentType = ct;
                    return true;
                }
                return false;
            })
        }
        // TODO: find

        try {
            const blob = b64toBlob(message.base64.replace(`data:${contentType};base64,`, ''), contentType);
            const file = new File([blob], message.filename, { type: `data:${contentType};base64` });
            fileSaver.saveAs(file);
        } catch (e) {
            console.warn('Content type missing form list, extension: ' + ext + ', in ' + message.base64.substr(0, 100) + '...')
        }

    }

    render() {

        const {className, onClick} = this.props;

        return (
            <div className={`chat ${className}`}>
                <div onClick={e => onClick ? onClick(e) : {}} className="chat-header">
                    <div className="row">
                        <div className="col-6">
                            <h6 className="text-white text-left pt-2">Conference</h6>
                        </div>
                        <div className="col-6">
                            <IconContext.Provider value={{ className: 'chat-icon', size: '1.5em' }}>
                                <div className="text-right fix-icon">
                                    <FaCommentDots />
                                </div>
                            </IconContext.Provider>
                        </div>
                    </div>
                </div>
                <div className="chat-box">
                    <div className="chat-history">
                        <ul className="chat-list">
                            {
                                this.state.messages.map((message: ChatMessage | ObjectMessage, index: number) => {

                                    const isSender: boolean = this.peerService.peerId === message.senderId;
                                    const date: string = getDateByTimestampFromNow(message.timestamp);
                                    const isJoining = message.type === MessageType.STATUS_MESSAGE;
                                    const extension = message.type === MessageType.FILE_MESSAGE ? (message as ObjectMessage).filename.split('.').pop() : '';

                                    return message.type === MessageType.FILE_MESSAGE ?
                                        <div key={index} className='message-box'>
                                            <div className='text-left clickable'
                                                onClick={() => this.download((message as ObjectMessage))}>
                                                <div className="username">{message.username}</div>
                                                <FileIcon extension={extension} {...defaultStyles.docx} size={70} />
                                                <div className="username">{(message as ObjectMessage).filename}</div>
                                                <div
                                                    className="username">{((message as ObjectMessage).size / 1024).toFixed(2)}kb
                                                </div>
                                                <time className="time">{date}</time>
                                            </div>
                                        </div> : (
                                            isJoining ?
                                                <div key={index} className="message-box">
                                                    <div className="text-center">
                                                        <div className="joining-bubble">{message.message}</div>
                                                    </div>
                                                </div>
                                                :
                                                <div key={index} className="message-box">
                                                    <div className={isSender ? 'text-right' : 'text-left'}>
                                                        < div className="username">{message.username}</div>
                                                        <div
                                                            className={isSender ? 'sender-bubble text-white' : 'receiver-bubble'}>{message.message}</div>
                                                        <time className="time">{date}</time>
                                                    </div>
                                                </div>)
                                })
                            }
                        </ul>
                        <div ref={this.refChatHistory} />
                    </div>
                    <div className="new-message">
                        <form onSubmit={(event: ChangeEvent<HTMLFormElement>) => this.handleSubmit(event)}>
                            <div className="form-row">
                                <div className="col-12">
                                    <div className="input-group">
                                        <input value={this.state.message} onChange={this.handleChange} type="text"
                                            className="form-control input-message"
                                            placeholder="Say something" />
                                        <div className="input-group-append">
                                            <button className="btn btn-primary" type="submit">
                                                <FaPaperPlane /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
