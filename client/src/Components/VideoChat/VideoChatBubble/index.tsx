import './index.css'
import React, { RefObject } from 'react';
import Video from '../util/Video';
import { FaExpand, FaCompress, FaExpandArrowsAlt } from 'react-icons/fa';

interface VideoChatBubbleProps {
    stream: Promise<MediaStream>
    className?: string
    index: number
    muted: boolean
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

    private readonly videoRef: RefObject<Video>;

    constructor(props: VideoChatBubbleProps) {
        super(props);
        this.videoRef = React.createRef<Video>();
    }

    componentDidUpdate(prevProps: VideoChatBubbleProps, prevState: VideoChatBubbleState) {
        if (prevProps.stream !== this.props.stream) {
            return true;
        } else {
            return false;
        }
    }

    private toggleFullScreen() {
        this.setState({
            fullscreen: !this.state.fullscreen
        })
    }

    render() {

        const { stream, index } = this.props;
        const { fullscreen } = this.state;

        const video = <Video ref={this.videoRef} className={fullscreen ? 'video-fullscreen' : 'bubble-video'} stream={stream}
            key="small" id={fullscreen ? '' : 'small' + index} muted={this.props.muted} />;

        return (

            <div className={fullscreen ? 'video-fullscreen-wrapper' : 'video-small-wrapper'}>
                <div className={fullscreen ? 'overlay overlay-fullscreen' : 'overlay overlay-small'} onClick={() => this.toggleFullScreen()}>
                    <div className="video-icon">
                        {fullscreen ? <FaCompress /> : <FaExpand />}
                    </div>
                </div>
                {fullscreen ? <div className='overlay overlay-fullscreen' onClick={() => this.videoRef.current!.requestFullscreen()}>
                    <div className="video-icon">
                        <FaExpandArrowsAlt />
                    </div>
                </div> : null}
                {video}
            </div>
        )
    }

}
