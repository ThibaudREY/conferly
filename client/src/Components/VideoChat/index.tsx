import './index.css';
import React                from 'react';
import VideoChatBubble      from './VideoChatBubble';
import {
    FaMicrophoneAlt,
    FaMicrophoneAltSlash,
    FaVideo,
    FaVideoSlash
}                           from 'react-icons/fa';
import {
    MdScreenShare,
    MdStopScreenShare
}                           from "react-icons/md";
import { injector }         from '../../index';
import StreamManagerService from '../../Services/Manager/stream-manager.service';

interface VideoChatProps {
    streams: Array<Promise<MediaStream>>
}

interface VideoChatState {
    micActive: boolean
    videoActive: boolean
    screenShare: boolean
    self: Promise<MediaStream>
}

export default class VideoChat extends React.Component<VideoChatProps, VideoChatState> {

    readonly state = {
        micActive: true,
        videoActive: true,
        screenShare: false,
        self: new Promise<MediaStream>(() => {})
    };

    private streamManagerService: StreamManagerService = injector.get(StreamManagerService);

    constructor(props: VideoChatProps) {
        super(props);
        this.state.self = this.streamManagerService.getUserMediaStream({video: true, audio: false})
    }

    private async toggleMic() {

        let currentPeerStream: MediaStream = this.streamManagerService.currentPeerMediaStream;

        if (currentPeerStream && currentPeerStream.getAudioTracks()[0]) {
            currentPeerStream.getAudioTracks()[0].enabled = !(currentPeerStream.getAudioTracks()[0].enabled);
            this.setState({
                micActive: !this.state.micActive
            });
        }
    }

    private async toggleVideo() {

        if (!this.state.screenShare) {
            let currentPeerStream: MediaStream = this.streamManagerService.currentPeerMediaStream;

            if (currentPeerStream && currentPeerStream.getVideoTracks()[0]) {
                currentPeerStream.getVideoTracks()[0].enabled = !(currentPeerStream.getVideoTracks()[0].enabled);
                this.setState({
                    videoActive: !this.state.videoActive
                });
            }
        }
    }

    private async toggleScreenShare() {

        let currentPeerStream: MediaStream = this.streamManagerService.currentPeerMediaStream;

        if (currentPeerStream && currentPeerStream.getVideoTracks()[0]) {
            this.setState(prevState => ({
                screenShare: !prevState.screenShare,
                videoActive: this.state.screenShare
            }), async () => {

                try {
                    await this.streamManagerService.switchCamera(this.state.screenShare);
                } catch {
                    this.setState(prevState => ({
                        screenShare: !prevState.screenShare,
                        videoActive: this.state.screenShare
                    }));
                }
            });
        }
    }

    render() {

        const {self} = this.state;

        return (
            <div className='video-chat'>
                <div className='video-chat-menu'>
                    <div className='menu-item menu-video-icon' onClick={() => this.toggleMic()}>{this.state.micActive ?
                        <FaMicrophoneAlt/> :
                        <FaMicrophoneAltSlash/>}</div>
                    <div className={`menu-item menu-video-icon ${this.state.screenShare ? 'disabled' : ''}`}
                         onClick={() => this.toggleVideo()}>{this.state.videoActive ?
                        <FaVideo/> : <FaVideoSlash/>} </div>
                    <div className='menu-item menu-video-icon'
                         onClick={() => this.toggleScreenShare()}>{this.state.screenShare ?
                        <MdStopScreenShare/> : <MdScreenShare/>} </div>
                </div>
                {
                    this.props.streams.concat([self]).map((stream: Promise<MediaStream>, index: number) => <VideoChatBubble index={index}
                                                                                                  stream={stream}
                                                                                                  key={index}/>)
                }
            </div>
        );
    }
}
