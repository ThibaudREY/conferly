import './index.css'
import React                    from 'react';
import Video                    from '../util/Video';
import update                   from 'react-addons-update';
import { FaExpand, FaCompress } from 'react-icons/fa';

interface VideoChatBubbleProps {
    stream: Promise<MediaStream>
    className?: string
    index: number
}

interface VideoChatBubbleState {
    fullscreen: boolean
    level: number
    intervalId?: number
}

export default class VideoChatBubble extends React.Component<VideoChatBubbleProps, VideoChatBubbleState> {

    readonly state = {
        fullscreen: false,
        level: 0,
        intervalId: 0
    };

    private expand() {
        this.setState({
            fullscreen: update(this.state.fullscreen, {$set: true})
        })
    }

    private reduce() {
        this.setState({
            fullscreen: update(this.state.fullscreen, {$set: false})
        })
    }

    render() {

        const {stream, index} = this.props;
        const {fullscreen} = this.state;

        const video = <Video className={fullscreen ? 'video-fullscreen' : 'bubble-video loud-ring'} stream={stream}
                             key={fullscreen ? 'fullscreen' : 'small' + index} id={fullscreen ? '' : 'small' + index}/>

        return fullscreen ?
            <div className={'video-fullscreen-wrapper'}>
                <div className='overlay overlay-fullscreen' onClick={() => this.reduce()}>
                    <FaCompress/>
                </div>
                {video}
            </div>

            : <div className="video-small-wrapper">
                <div className='overlay overlay-small' onClick={() => this.expand()}>
                    <FaExpand/>
                </div>
                {video}
            </div>
    }

}
