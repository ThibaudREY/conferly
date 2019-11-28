import React, { Component }        from 'react';
import PeerService, { subscriber } from '../../Services/Peer/peer.service';
import SimplePeer                  from 'simple-peer';
import { Subscription }            from 'rxjs';
import update                      from 'react-addons-update';
import StreamManagerService        from '../../Services/Manager/StreamManagerService';
import { injector }                from '../..';
import Chat                        from './Chat';
import './index.css';
import Board                       from './Board';
import PeerJoinModal               from '../PeerJoinModal';
import FileDrop                    from './FileDrop';
import { ToastContainer }          from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


interface MeetingProps {
    match: any
    location: any
}

interface MeetingState {
    joined: boolean,
    showModal: boolean,
    peerConnections: Map<string, SimplePeer.Instance>
}

export default class Meeting extends Component<MeetingProps, MeetingState> {

    readonly state = {
        joined: false,
        showModal: true,
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
                        peerConnections: update(this.state.peerConnections, {$set: peerConnections})
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
                        <PeerJoinModal visible={showModal} handleClose={() => this.closeModal()}></PeerJoinModal>
                        <Board/>
                    </div>
                </div>
                <div className="row fixed-bottom">
                    <div className="col-sm-8">
                        <Chat></Chat>
                    </div>
                    <div className="col-sm-4 pl-0">
                        <FileDrop/>
                    </div>
                </div>
                <ToastContainer />
            </div>
        );
    }
}
