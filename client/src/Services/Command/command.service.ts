import { Commands }                from './Commands/commands.enum';
import SimplePeer                  from 'simple-peer';
import LZString                    from 'lz-string';
import PeerService, { subscriber } from '../Peer/peer.service';
import { injector }                from '../../index';

export default class CommandService {

    private static commands: Map<Commands, Function> = new Map<Commands, Function>();

    public static async parse(self: any, data: string): Promise<string> {

        data = LZString.decompressFromBase64(data);

        const senderId: string = data.substr(0, 10);

        console.log(CommandService.commands.get(data.substr(10, 20) as Commands));

        if (CommandService.commands.get(data.substr(10, 20) as Commands)) {
            (CommandService.commands.get(data.substr(10, 20) as Commands) as Function)(self, data);
        }

        return new Promise(resolve => resolve(senderId));
    }

    public static register(command: Commands, callback: Function) {
        CommandService.commands.set(command, callback);
    }

    public static send(pc: SimplePeer.Instance, peerId: string, command: Commands, data?: string) {
        pc.send(LZString.compressToBase64(`${peerId}${command}${data}`));
    }

    public static broadcast(command: Commands, data?: string, timeout?: number) {
        Array.from(subscriber.value.entries()).forEach((entry: [string, SimplePeer.Instance]) => {
            CommandService.send(entry[1], injector.get(PeerService).peerId, command, data)
        })
    }
}
