import React, { Component }              from 'react';
import PeerService, { peers }            from '../../Services/Peer/peer.service';
import StreamManagerService, { streams } from '../../Services/Manager/stream-manager.service';
import SimplePeer                        from 'simple-peer';
import { Subscription }                  from 'rxjs';
import update                            from 'react-addons-update';
import { injector }                      from '../..';
import Chat                              from './Chat';
import './index.css';
import Board                             from './Board';
import PeerJoinModal                     from '../PeerJoinModal';
import FileDrop                          from './FileDrop';
import { ToastContainer }                from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Board                             from './Board';
import PeerJoinModal                     from '../PeerJoinModal';
import VideoChat                         from '../VideoChat';


interface MeetingProps {
    match: any
    location: any
}

interface MeetingState {
    joined: boolean,
    showModal: boolean,
    peerConnections: Map<string, SimplePeer.Instance>,
    streams: Array<MediaStream>
}

export default class Meeting extends Component<MeetingProps, MeetingState> {

    readonly state = {
        joined: false,
        showModal: true,
        peerConnections: new Map(),
        streams: []
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

        peers.subscribe(
            (peerConnections: Map<string, SimplePeer.Instance>) => {
                if (peerConnections) {
                    this.setState({
                        peerConnections: update(this.state.peerConnections, {$set: peerConnections})
                    });
                }
            });

        streams.subscribe(
            (streams: Map<string, Promise<MediaStream>>) => {

                if (streams) {

                    let s = Array.from(streams.entries()).reduce((acc: Array<Promise<MediaStream>>, current: [string, Promise<MediaStream>]) => {
                        acc.push(current[1]);
                        return acc;
                    }, []);

                    this.setState({
                        streams: update(this.state.streams, {$set: s})
                    });
                }
            }
        );
    }

    private async closeModal(): Promise<void> {

        const {roomId} = this.props.match.params;

        this.setState({showModal: false});

        if (((this.props.location.state && !this.props.location.state.joined) || !this.props.location.state))
            await this.peerService.joinRoom(roomId)

    }

    render() {

        const {showModal} = this.state;

        return (
            <div className="mr-5 ml-5 mt-2">
                <div className="row">
                    <div className="col-sm-12">
                        <VideoChat streams={streams}/>
                        <PeerJoinModal visible={showModal} handleClose={() => this.closeModal()}/>
                        <Board/>
                    </div>
                </div>
                <div className="row fixed-bottom">
                    <div className="col-sm-8">
                        <Chat/>
                    </div>
                    <div className="col-sm-4 pl-0">
                        <FileDrop/>
                    </div>
                </div>
                <ToastContainer/>
            </div>
        );
    }
}
