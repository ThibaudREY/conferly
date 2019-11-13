import { Component, ChangeEvent, RefObject, createRef } from "react";
import ChatMessage from "../../../Models/chat-message.model";
import PeerService from "../../../Services/Peer/peer.service";
import React from "react";
import update from 'react-addons-update';
import { FaPaperPlane, FaCommentDots } from 'react-icons/fa';
import { Subscription } from "rxjs";
import ChatManagerService from "../../../Services/Manager/ChatManagerService";
import { IconContext } from "react-icons";
import SimplePeer from "simple-peer";
import CommandService from "../../../Services/Command/command.service";
import { Commands } from "../../../Services/Command/Commands/commands.enum";
import getDateByTimestampFromNow from '../../../Utils/date';
import { MessageType } from "../../../Enums/message-type.enum";
import { injector } from "../../..";
import './index.css';

interface ChatProps {

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

    constructor(props: ChatProps) {
        super(props);
        this.peerService = injector.get(PeerService);
        this.chatManagerService = injector.get(ChatManagerService);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        CommandService.register(Commands.RCV_MESSAGE, (self: any, data: string) => {
            this.receivedMessage = JSON.parse(data.substr(30));
            this.chatManagerService.addMessage(this.receivedMessage);
        });
        this.refChatHistory = createRef<HTMLDivElement>()
    }

    async componentDidMount(): Promise<void> {

        this.subscription = this.chatManagerService.messages.subscribe(
            (messages: ChatMessage[]) => {
                this.setState({
                    messages: update(this.state.messages, { $set: messages })
                });
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
            const chatMessage = new ChatMessage(this.peerService.peerId, this.state.message, MessageType.PEER_MESSAGE);
            this.chatManagerService.addMessage(chatMessage);
            Array.from(this.peerService.peerConnections.entries()).forEach((entry: [string, SimplePeer.Instance]) => {
                entry[1].send(`${this.peerService.peerId}${Commands.RCV_MESSAGE}${JSON.stringify(chatMessage)}`);
            })
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

    render() {

        return (
            <div className="chat">
                <div className="chat-header">
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
                                this.state.messages.map((message: ChatMessage, index: number) => {

                                    const isSender: boolean = this.peerService.peerId === message.senderId ? true : false;
                                    const date: string = getDateByTimestampFromNow(message.timestamp);
                                    const isJoining = message.type === MessageType.STATUS_MESSAGE ? true : false;

                                    return isJoining ?
                                        <div key={index} className="message-box">
                                            <div className="text-center">
                                                <div className="joining-bubble">{message.message}</div>
                                            </div>
                                        </div>
                                        :
                                        <div key={index} className="message-box">
                                            <div className={isSender ? 'text-right' : 'text-left'}>
                                                < div className="username">{message.senderId}</div>
                                                <div className={isSender ? 'sender-bubble text-white' : 'receiver-bubble'}>{message.message}</div>
                                                <time className="time">{date}</time>
                                            </div>
                                        </div>
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
                                        <input value={this.state.message} onChange={this.handleChange} type="text" className="form-control input-message" placeholder="Say something"></input>
                                        <div className="input-group-append">
                                            <button className="btn btn-primary" type="submit"><FaPaperPlane ></FaPaperPlane></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div >
        );
    }
}