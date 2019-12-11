import { Injectable } from 'injection-js';
import { BehaviorSubject } from 'rxjs';

export const streams = new BehaviorSubject(new Map<string, Promise<MediaStream>>());

@Injectable()
export default class StreamManagerService {

    private _mediaStreams: Map<string, Promise<MediaStream>>;
    private _currentPeerMediaStream?: MediaStream;

    /**
     * @constructor
     */
    constructor() {
        this._mediaStreams = new Map<string, Promise<MediaStream>>();
        streams.next(this._mediaStreams);
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

    public get currentPeerMediaStream(): MediaStream | undefined {
        return this._currentPeerMediaStream;
    }
    public set currentPeerMediaStream(stream: MediaStream | undefined) {
        this._currentPeerMediaStream = stream;
    }
}
