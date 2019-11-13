import './index.css';
import React                from 'react';
import VideoChatBubble from './VideoChatBubble';
import {
    FaCompressArrowsAlt,
    FaExpandArrowsAlt,
    FaMicrophoneAlt,
    FaMicrophoneAltSlash,
    FaVideo,
    FaVideoSlash
}                     from 'react-icons/fa';
import {
    MdScreenShare,
    MdStopScreenShare
}                     from "react-icons/md";
import update         from 'react-addons-update';
import Video          from './util/Video';
import { injector }   from '../../index';
import MergerService  from '../../Services/Peer/merger.service';
import { peers }      from '../../Services/Peer/peer.service';

interface VideoChatProps {
    streams: Array<Promise<MediaStream>>
}

interface VideoChatState {
    micActive: boolean
    videoActive: boolean
    screenShare: boolean
    fullscreen: boolean
}

export default class VideoChat extends React.Component<VideoChatProps, VideoChatState> {

    readonly state = {
        micActive: true,
        videoActive: true,
        screenShare: false,
        fullscreen: false,
    };

    private mergerService: MergerService = injector.get(MergerService);

    private toggleMic() {
        this.setState({
            micActive: update(this.state.micActive, {$set: !this.state.micActive})
        });
        // TODO: clone each peers' stream
        // TODO: deactivate audio
        // TODO: addStream to merger
        // TODO: remove(pop) stream from merger
        // TODO: should work
        peers.value.forEach((pc: any) => {
            let clone: MediaStream = pc.streams[0].clone();
            //clone.getVideoTracks()[0].enabled = !(clone.getVideoTracks()[0].enabled);
            this.mergerService.add(clone);
            //this.mergerService.pop();
        });
    }

    private async toggleVideo() {
        this.setState({
            videoActive: update(this.state.videoActive, {$set: !this.state.videoActive})
        });
        // TODO: clone each peers' stream
        // TODO: deactivate video
        // TODO: addStream to merger
        // TODO: remove(pop) stream from merger
        // TODO: should work
    }

    private toggleScreenShare() {
        this.setState({
            screenShare: update(this.state.screenShare, {$set: !this.state.screenShare}),
            videoActive: update(this.state.videoActive, {$set: this.state.screenShare})
        })
    }

    private toggleFullscreen() {
        this.setState({
            fullscreen: update(this.state.fullscreen, {$set: !this.state.fullscreen})
        })
    }

    private getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }


    render() {
        return (
            <div className={`video-chat ${this.state.fullscreen ? 'fullscreen' : ''}`}>
                <div className='video-chat-menu'>
                    <div className='menu-item' onClick={() => this.toggleMic()}>{this.state.micActive ?
                        <FaMicrophoneAlt/> :
                        <FaMicrophoneAltSlash/>}</div>
                    <div className='menu-item' onClick={() => this.toggleVideo()}>{this.state.videoActive ?
                        <FaVideo/> : <FaVideoSlash/>} </div>
                    <div className='menu-item' onClick={() => this.toggleScreenShare()}>{this.state.screenShare ?
                        <MdScreenShare/> : <MdStopScreenShare/>} </div>
                    <div className="menu-item" onClick={() => this.toggleFullscreen()}>{this.state.fullscreen ?
                        <FaCompressArrowsAlt/> : <FaExpandArrowsAlt/>} </div>
                </div>
                {
                    this.props.streams.map((stream: Promise<MediaStream>, index: number) => {
                        return this.state.fullscreen ? <Video stream={stream} key={index}/> :
                            <VideoChatBubble index={index} stream={stream} key={index}/>
                    })
                }
            </div>
        );
    }
}
