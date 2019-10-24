import React, { Component } from 'react';
import PeerService, { subscriber } from '../../Services/Peer/peer.service';
import SimplePeer from 'simple-peer';
import { Subscription } from 'rxjs';
import update from 'react-addons-update';
import StreamManagerService from '../../Services/Manager/StreamManagerService';
import { injector } from '../..';

interface MeetingProps {
    match: any
    location: any
}

interface MeetingState {
    joined: boolean
    peerConnections: Map<string, SimplePeer.Instance>
}

export default class Meeting extends Component<MeetingProps, MeetingState> {

    readonly state = {
        joined: false,
        peerConnections: new Map()
    };

    private peerService: PeerService;
    private streamManagerService: StreamManagerService;
    private subscription?: Subscription;

    constructor(props: MeetingProps) {
        super(props)
        this.peerService = injector.get(PeerService);
        this.streamManagerService = injector.get(StreamManagerService);
    }

    async componentDidMount(): Promise<void> {

        this.subscription = subscriber.subscribe(
            (peerConnections: Map<string, SimplePeer.Instance>) => {
                if (peerConnections) {
                    this.setState({
                        peerConnections: update(this.state.peerConnections, { $set: peerConnections })
                    });

                    Array.from(peerConnections.entries()).forEach((entry: [string, SimplePeer.Instance]) => {

                        if (!this.streamManagerService.streams.has(entry[0])) {

                            const stream: Promise<MediaStream> = new Promise<MediaStream>(
                                resolve => {
                                    entry[1].on('stream', (stream: MediaStream) => {
                                        resolve(stream);
                                    })
                                }
                            )
                            this.streamManagerService.subscribePeerStream(entry[0], stream);
                        }
                    })
                }
            });

        const { roomId } = this.props.match.params;

        if ((this.props.location.state && !this.props.location.state.joined) || !this.props.location.state)
            await this.peerService.joinRoom(roomId)
    }

    render() {

        const { peerConnections } = this.state;

        return (
            <div>
                Meeting works !
                <ul>
                    {
                        Array.from(peerConnections.entries()).map((value: [string, SimplePeer.Instance]) => {
                            return <li key={value[0]}>{value[0]}</li>
                        })
                    }
                </ul>
            </div>
        );
    }
}
