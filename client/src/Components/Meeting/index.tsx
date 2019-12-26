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
import ToolBarItem                       from '../../Models/toolbar-item.model';
import { FaPaintBrush }                  from 'react-icons/fa';
import VideoChat                         from '../VideoChat';
import ToolBar                           from './Toolbar';
import { splashSreen }                   from '../Splash';
import { AiOutlineMessage }              from 'react-icons/ai';

interface MeetingProps {
    match: any
    location: any
}

interface MeetingState {
    joined: boolean,
    showModal: boolean,
    peerConnections: Map<string, SimplePeer.Instance>,
    streams: Array<MediaStream>,
    items: ToolBarItem[]
}

export default class Meeting extends Component<MeetingProps, MeetingState> {

    readonly state = {
        joined: false,
        showModal: true,
        peerConnections: new Map(),
        streams: [],
        items: [
            new ToolBarItem('board', 'Board', <FaPaintBrush/>, false, true, false),
            new ToolBarItem('chat', 'Chat', <AiOutlineMessage/>, false, true, true),
        ]
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

        if (((this.props.location.state && !this.props.location.state.joined) || !this.props.location.state)) {
            await this.peerService.joinRoom(roomId)
            splashSreen.next({show: true, message: ''});
        }
    }

    public toogleToolbarItem(index: number): void {

        let updatedItems = this.state.items.filter((item: ToolBarItem) => {
            return !item.lock
        });
        if (!updatedItems[index].sticky) {
            updatedItems.forEach((item: ToolBarItem, indexItem: number) => {
                if (indexItem === index) {
                    item.show = !item.show;
                } else {
                    if (!item.sticky) {
                        item.show = false;
                    }
                }
            });
        } else {
            updatedItems[index].show = !updatedItems[index].show;
        }
        this.setState({
            items: update(this.state.items, {$set: updatedItems})
        });
    }

    private toggleItemAt(index: number) {
        let updatedItems = this.state.items;
        updatedItems[index].show = !updatedItems[index].show;
        this.setState({
            items: update(this.state.items, {$set: updatedItems})
        });
    }

    render() {

        const {showModal, streams, items} = this.state;

        const showLanding = items.filter(i => !i.sticky).every((item: ToolBarItem) => {
            return !item.show
        });

        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        {
                            showLanding ?
                                <div className='splash-wrapper'>
                                    <img src={process.env.PUBLIC_URL + '/landing.svg'} alt=''/>
                                </div> :
                                <div>
                                    <Board visible={this.state.items[0].show}/>
                                </div>
                        }
                        <VideoChat streams={streams}/>
                        <ToolBar toggleItem={this.toogleToolbarItem.bind(this)}
                                 items={this.state.items.filter(item => !item.lock)}/>
                        <PeerJoinModal visible={showModal} handleClose={() => this.closeModal()}/>
                    </div>
                </div>
                <div className={`row fixed-bottom ${!this.state.items[1].show ? 'retracted' : ''}`} onClick={(e: React.MouseEvent) => !this.state.items[1].show ? this.toggleItemAt(1) : {}}>
                    <div className="col-8">
                        <Chat/>
                    </div>
                    <div className="col-4 pl-0">
                        <FileDrop/>
                    </div>
                </div>
                <ToastContainer/>
            </div>
        );
    }
}
