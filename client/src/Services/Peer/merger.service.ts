import { Injectable }         from 'injection-js';
import * as VideoStreamMerger from "video-stream-merger";

@Injectable()
export default class MergerService {
    public merger = new VideoStreamMerger();

    private clones: Array<MediaStream> = [];

    constructor () {
        this.merger.start();
    }

    public async getUserMedia() {
        this.merger.addStream(await navigator.mediaDevices.getUserMedia({video: true, audio: true}));
        //this.merger.addStream(await navigator.mediaDevices.getUserMedia({video: true, audio: true}));
        //this.merger.addStream((await navigator.mediaDevices as any).getDisplayMedia({video: true, audio: true}));
        return this.merger;
    }

    public add(stream: MediaStream) {
        this.clones.push(stream);
        this.merger.addStream(this.clones[this.clones.length-1])
    }

    public pop() {
        this.merger.removeStream(this.clones.pop())
    }
}
