import { Injectable } from 'injection-js';
import { peers }      from './peer.service';

@Injectable()
export default class MergerService {

    private stream!: MediaStream;

    public async getStream() {
        this.stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
        return this.stream;
    }

    public addCamera() {

    }

    public async addScreen() {
        const screen = (await (navigator.mediaDevices as any).getDisplayMedia({video: true, audio: true}) as MediaStream);
        peers.value.forEach((peer: any) => {
            console.log(peer);
            peer.removeTrack(this.stream.getTracks()[0], this.stream);
            peer.addTrack(screen.getTracks()[0], this.stream);
            // this.stream.addTrack(screen.getAudioTracks()[0]);
        });
    }
}
