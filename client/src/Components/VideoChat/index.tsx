import './index.css';
import React from 'react';
import VideoChatBubble from './VideoChatBubble';
import {
    FaMicrophoneAlt,
    FaMicrophoneAltSlash,
    FaVideo,
    FaVideoSlash
} from 'react-icons/fa';
import {
    MdScreenShare,
    MdStopScreenShare
} from "react-icons/md";
import update from 'react-addons-update';
import { injector } from '../../index';
import MergerService from '../../Services/Peer/merger.service';
import StreamManagerService from '../../Services/Manager/stream-manager.service';

interface VideoChatProps {
    streams: Array<Promise<MediaStream>>
}

interface VideoChatState {
    micActive: boolean
    videoActive: boolean
    screenShare: boolean
}

export default class VideoChat extends React.Component<VideoChatProps, VideoChatState> {

    readonly state = {
        micActive: true,
        videoActive: true,
        screenShare: false
    };

    private streamManagerService: StreamManagerService = injector.get(StreamManagerService);

    private async toggleMic() {
        let currentPeerStream: MediaStream | undefined = this.streamManagerService.currentPeerMediaStream;

        if (currentPeerStream && currentPeerStream.getAudioTracks()[0]) {
            currentPeerStream.getAudioTracks()[0].enabled = !(currentPeerStream.getAudioTracks()[0].enabled);
            this.setState({
                micActive: update(this.state.micActive, { $set: !this.state.micActive })
            });
        }
    }

    private async toggleVideo() {
        let currentPeerStream: MediaStream | undefined = this.streamManagerService.currentPeerMediaStream;

        if (currentPeerStream && currentPeerStream.getVideoTracks()[0]) {
            currentPeerStream.getVideoTracks()[0].enabled = !(currentPeerStream.getVideoTracks()[0].enabled);
            this.setState({
                videoActive: update(this.state.videoActive, { $set: !this.state.videoActive })
            });
        }
    }

    private async toggleScreenShare() {
        // await this.mergerService.addScreen();

        this.setState({
            screenShare: update(this.state.screenShare, { $set: !this.state.screenShare }),
            videoActive: update(this.state.videoActive, { $set: this.state.screenShare })
        })
    }

    render() {
        return (
            <div className='video-chat'>
                <div className='video-chat-menu'>
                    <div className='menu-item menu-video-icon' onClick={() => this.toggleMic()}>{this.state.micActive ?
                        <FaMicrophoneAlt /> :
                        <FaMicrophoneAltSlash />}</div>
                    <div className='menu-item menu-video-icon' onClick={() => this.toggleVideo()}>{this.state.videoActive ?
                        <FaVideo /> : <FaVideoSlash />} </div>
                    <div className='menu-item menu-video-icon' onClick={() => this.toggleScreenShare()}>{this.state.screenShare ?
                        <MdScreenShare /> : <MdStopScreenShare />} </div>
                </div>
                {
                    this.props.streams.map((stream: Promise<MediaStream>, index: number) => <VideoChatBubble index={index} stream={stream} key={index} />)
                }
            </div>
        );
    }
}
