import { Injectable }      from 'injection-js';
import { BehaviorSubject } from 'rxjs';
import { peers } from '../Peer/peer.service';
import { toast } from 'react-toastify';
import { User } from '../../Models/user.model';

export const streams = new BehaviorSubject(new Map<string, Promise<MediaStream>>());

@Injectable()
export default class StreamManagerService {

    private _mediaStreams: Map<string, Promise<MediaStream>>;
    private _currentPeerMediaStream: MediaStream;

    /**
     * @constructor
     */
    constructor() {
        this._mediaStreams = new Map<string, Promise<MediaStream>>();
        this._currentPeerMediaStream = new MediaStream();
        streams.next(this._mediaStreams);
    }

    /**
     * Get user media stream
     */
    public async getUserMediaStream(constraints: {video: boolean, audio: boolean} = {video: true, audio: true}) {
        let ms = new MediaStream();
        try {
            ms = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (e) {
            toast('It seems we don\'t have permission to access your camera, you may want to allow it to use the video chat', { type: 'error', autoClose: false, toastId: 'camera' });
        }
        return ms;
    }

    /**
     * Subscribe peer media stream
     * @param {string} peerId
     * @param {Promise<MediaStream>} stream
     * @returns {void}
     */
    public subscribePeerStream(peerId: string, stream: Promise<MediaStream>): void {

        if (!this._mediaStreams.has(peerId)) {
            this._mediaStreams.set(peerId, stream);
        }
        streams.next(this._mediaStreams);
    }

    /**
     * Unsubscribe peer media stream
     * @param {string} peerId
     * @returns {void}
     */
    public unsubscribePeerStream(peerId: string): void {
        this._mediaStreams.delete(peerId);
        streams.next(this._mediaStreams);
    }

    /**
     * Clear all media stream
     * @returns {void}
     */
    public clearPeersStream(): void {
        this._mediaStreams.clear();
        streams.next(this._mediaStreams);
    }

    /**
     * Switch camera to display media
     * @param toggle
     */
    public async switchCamera(toggle: boolean) {

        if (toggle) {

            try {
                const screen = (await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: true }) as MediaStream);

                if (screen.getVideoTracks()[0]) {
                    screen.getVideoTracks()[0].addEventListener('ended', () => this.switchCamera(false));
                }

                peers.value.forEach(async (peer: { instance: any, user: User }) => {

                    try {
                        peer.instance.replaceTrack((await this.getCurrentPeerMediaStream()).getVideoTracks()[0], screen.getVideoTracks()[0], (await this.getCurrentPeerMediaStream()));
                    } catch (err) {
                        console.log(err);
                    }
                });

                this._currentPeerMediaStream.removeTrack((await this.getCurrentPeerMediaStream()).getVideoTracks()[0]);
                this._currentPeerMediaStream.addTrack(screen.getVideoTracks()[0]);

            } catch (err) {
                throw new Error('nik');
            }

        } else {
            const video = await this.getUserMediaStream();

            peers.value.forEach(async (peer: { instance: any, user: User }) => {

                try {
                    peer.instance.replaceTrack((await this.getCurrentPeerMediaStream()).getVideoTracks()[0], video.getVideoTracks()[0], (await this.getCurrentPeerMediaStream()));
                } catch (err) {
                    console.log(err);
                }
            });

            this._currentPeerMediaStream.removeTrack((await this.getCurrentPeerMediaStream()).getVideoTracks()[0]);
            this._currentPeerMediaStream.addTrack(video.getVideoTracks()[0]);
        }
    }

    /**
     * Stop all streaming tracks
     * @param {MediaStream} media Media Stream
     */
    public stopMediaStream(media: MediaStream) {
        if (media) {
            media.getTracks().forEach((track: MediaStreamTrack) => {
                track.stop();
            });
        }
    }

    /**
     * Returns current media stream map
     * @returns {Map<string, Promise<MediaStream>>}
     */
    public get streams(): Map<string, Promise<MediaStream>> {
        return streams.value;
    }


    public set streams(value: Map<string, Promise<MediaStream>>) {
        this._mediaStreams = value;
        streams.next(this._mediaStreams);
    }

    public async getCurrentPeerMediaStream(): Promise<MediaStream> {

        if (this._currentPeerMediaStream.getTracks().length < 1) {
            this._currentPeerMediaStream = await this.getUserMediaStream();
        }

        return this._currentPeerMediaStream;
    }
}
