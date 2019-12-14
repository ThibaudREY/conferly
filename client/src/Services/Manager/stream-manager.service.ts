import { Injectable } from 'injection-js';
import { BehaviorSubject } from 'rxjs';
import { peers } from '../Peer/peer.service';

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
    public async getUserMediaStream() {
        return await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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

                peers.value.forEach((peer: any) => {

                    try {
                        peer.replaceTrack(this._currentPeerMediaStream.getVideoTracks()[0], screen.getVideoTracks()[0], this._currentPeerMediaStream);
                    } catch (err) {
                        console.log(err);
                    }
                });

                this._currentPeerMediaStream.removeTrack(this.currentPeerMediaStream.getVideoTracks()[0]);
                this._currentPeerMediaStream.addTrack(screen.getVideoTracks()[0]);

            } catch (err) {
                throw new Error('nik');
            }

        } else {
            const video = await this.getUserMediaStream();

            peers.value.forEach((peer: any) => {

                try {
                    peer.replaceTrack(this._currentPeerMediaStream.getVideoTracks()[0], video.getVideoTracks()[0], this._currentPeerMediaStream);
                } catch (err) {
                    console.log(err);
                }
            });

            this._currentPeerMediaStream.removeTrack(this.currentPeerMediaStream.getVideoTracks()[0]);
            this._currentPeerMediaStream.addTrack(video.getVideoTracks()[0]);
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

    public get currentPeerMediaStream(): MediaStream {
        return this._currentPeerMediaStream;
    }

    public set currentPeerMediaStream(value: MediaStream) {
        this._currentPeerMediaStream = value;
    }
}
