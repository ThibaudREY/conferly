import { Commands }           from './Commands/commands.enum';
import SimplePeer             from 'simple-peer';
import LZString               from 'lz-string';
import PeerService, { peers } from '../Peer/peer.service';
import { injector }           from '../../index';
import { User }               from '../../Models/user.model';
import { toast }              from 'react-toastify';

export default class CommandService {

    private commands: Map<Commands, Function> = new Map<Commands, Function>();

    public async parse(self: any, data: string): Promise<string> {

        data = LZString.decompressFromBase64(data);

        const senderId: string = data.substr(0, 10);

        if (this.commands.get(data.substr(10, 20) as Commands)) {
            (this.commands.get(data.substr(10, 20) as Commands) as Function)(self, data);
        }

        return new Promise(resolve => resolve(senderId));
    }

    public register(command: Commands, callback: Function) {
        this.commands.set(command, callback);
    }

    public send(pc: SimplePeer.Instance, peerId: string, command: Commands, data?: string | ArrayBuffer | null) {
        try {
            pc.send(LZString.compressToBase64(`${peerId}${command}${data}`));
        } catch (e) {
            toast('Failed to reach peer', {type: 'warning'})
        }
    }

    public broadcast(command: Commands, data?: string | ArrayBuffer | null, timeout?: number, destinees: string[] = []) {
        if (destinees.length === 0) {
            Array.from(peers.value.entries()).forEach((entry: [string, {instance: SimplePeer.Instance, user: User}]) => {
                this.send(entry[1].instance, injector.get(PeerService).peerId, command, data)
            })
        } else {
            destinees.forEach((peerId: string) => {
                this.send(peers.value.get(peerId).instance, injector.get(PeerService).peerId, command, data)
            })
        }
    }
}
