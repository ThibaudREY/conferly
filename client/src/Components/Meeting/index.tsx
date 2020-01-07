import React, { Component }                              from 'react';
import PeerService, { peers }                            from '../../Services/Peer/peer.service';
import StreamManagerService, { streams }                 from '../../Services/Manager/stream-manager.service';
import SimplePeer                                        from 'simple-peer';
import { Subscription }                                  from 'rxjs';
import update                                            from 'react-addons-update';
import { injector }                                      from '../..';
import Chat                                              from './Chat';
import Board                                             from './Board';
import PeerJoinModal                                     from '../PeerJoinModal';
import FileDrop                                          from './FileDrop';
import { ToastContainer }                                from 'react-toastify';
import { AiOutlineMessage }                              from 'react-icons/ai';
import { FaPaintBrush, FaGithub, FaGitlab, FaGitkraken } from 'react-icons/fa';
import CommandService                                    from '../../Services/Command/command.service';
import { Commands }                                      from '../../Services/Command/Commands/commands.enum';
import { onNewService }                                  from '../../Services/Command/Commands/appServicesCommands';
import { appServices }                                   from '../../Services/Manager/app-service.service';
import ToolBarItem                                       from '../../Models/toolbar-item.model';
import VideoChat                                         from '../VideoChat';
import ToolBar                                           from './Toolbar';
import { splashSreen }                                   from '../Splash';
import GitFlow                                           from './GitFlow';
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

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
        // /!\ ORDER IS IMPORTANT:
        // 0 => BOARD
        // 1 => CHAT
        // 2 => GITHUB
        // 3 => GITKRAKEN
        // 4 => GITLAB
        items: [
            new ToolBarItem('board', 'Board', <FaPaintBrush/>, false, true, false, false),
            new ToolBarItem('chat', 'Chat', <AiOutlineMessage/>, false, true, true, false),
            new ToolBarItem('github', 'Github', <FaGithub/>, true, false, false, true),
            new ToolBarItem('gitkraken', 'GitKranken', <FaGitkraken/>, true, false, false, true),
            new ToolBarItem('gitlab', 'GitLab', <FaGitlab/>, true, false, false, true),
        ]
    };

    private peerService: PeerService;
    private streamManagerService: StreamManagerService;
    private commandService: CommandService;
    private subscription?: Subscription;

    constructor(props: MeetingProps) {
        super(props)
        this.peerService = injector.get(PeerService);
        this.streamManagerService = injector.get(StreamManagerService);
        this.commandService = injector.get(CommandService);
        this.commandService.register(Commands.SERVICE_UPDATE, onNewService);
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

        appServices.subscribe(appServices => {

            this.state.items.forEach((item) => {
                if (item.service && appServices.has(item.name)) {
                    item.lock = false;
                } else {
                    if (item.service) {
                        item.lock = true;
                    }
                }
            });

            this.setState({
                items: update(this.state.items, {$set: this.state.items})
            });
        });
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

        const selectedGitItem = items.find(i => i.show && [2, 3, 4].includes(items.indexOf(i)));
        const selectedGitServiceToken = selectedGitItem ? localStorage.getItem(selectedGitItem.name) : '';
        const showGit = (items[2] && items[2].show) || (items[3] && items[3].show) || (items[4] && items[4].show);

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
                                    <Board visible={items[0].show}/>
                                </div>
                        }
                        <GitFlow provider={selectedGitItem ? selectedGitItem.name as ("github" | "bitbucket" | "gitlab") : undefined} token={selectedGitServiceToken}
                            visible={showGit}/>
                        <VideoChat streams={streams}/>
                        <ToolBar toggleItem={this.toogleToolbarItem.bind(this)} items={items}/>
                        <PeerJoinModal visible={showModal} handleClose={() => this.closeModal()}/>
                    </div>
                </div>
                <div className={`row fixed-bottom ${!items[1].show ? 'retracted' : ''}`}
                     onClick={(e: React.MouseEvent) => !items[1].show ? this.toggleItemAt(1) : {}}>
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
