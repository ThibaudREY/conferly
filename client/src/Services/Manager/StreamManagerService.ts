import { injectable } from "inversify";

@injectable()
export default class StreamManagerService {

    private _mediaStreams: Map<string, Promise<MediaStream>>;

    /**
     * @constructor
     */
    constructor() {
        this._mediaStreams = new Map<string, Promise<MediaStream>>();
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
    }

    /**
     * Unsubscribe peer media stream
     * @param {string} peerId
     * @returns {void}
     */
    public unsubscribePeerStream(peerId: string): void {
        this._mediaStreams.delete(peerId);
    }

    /**
     * Clear all media stream
     * @returns {void}
     */
    public clearPeersStream(): void {
        this._mediaStreams.clear();
    }

    /**
     * Returns current media stream map
     * @returns {Map<string, Promise<MediaStream>>}
     */
    public get streams(): Map<string, Promise<MediaStream>> {
        return this._mediaStreams;
    }
}