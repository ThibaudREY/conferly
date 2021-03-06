import React, { CSSProperties } from 'react';

interface VideoProps {
    children?: Element,
    stream: Promise<MediaStream>,
    height?: number,
    width?: number,
    muted?: boolean,
    className?: string
    style?: CSSProperties
    id?: string
}

export default class Video extends React.Component<VideoProps, {}> {
    private video: HTMLVideoElement = document.createElement('video');

    async componentDidMount() {
        this.video.srcObject = await this.props.stream;
    }

    async componentDidUpdate(prevProps: VideoProps) {
        const prevStream = await prevProps.stream;
        const currentStream = await this.props.stream;

        if (this.video) {
            this.video.srcObject = currentStream;
        }

        if (prevStream !== currentStream) {
            return true;
        } else {
            return false;
        }
    }

    async requestFullscreen() {
        await this.video.requestFullscreen();
    }

    render() {
        const { id, width, height, muted, children, className, style } = this.props;

        const video = <video
            id={id}
            autoPlay={true}
            style={style}
            height={height}
            width={width}
            muted={muted}
            className={className}
            ref={(video: HTMLVideoElement) => {
                this.video = video;
            }}
        >
            {children}
        </video>;

        return this.video.srcObject && (this.video.srcObject as MediaStream).getVideoTracks()[0] && (this.video.srcObject as MediaStream).getVideoTracks()[0].enabled ? (
            <div>
                {video}
            </div>
        ) : (
                <div>
                    <div className='hidden'>
                        {video}
                    </div>
                    <div className="video-small-wrapper">
                        <div className='bubble-name'>
                            <div>toto</div>
                            <div className='name-bold'>tata</div>
                        </div>
                    </div>
                </div>
            );
    }
}
