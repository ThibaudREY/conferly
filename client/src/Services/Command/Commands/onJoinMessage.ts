import PeerService from '../../Peer/peer.service';
import ChatManagerService from '../../Manager/ChatManagerService';
import { injector } from '../../..';

export default async function onJoinMessage(self: PeerService, data: string) {

    const receivedMessage = JSON.parse(data.substr(30));

    const chatManagerService: ChatManagerService = injector.get(ChatManagerService);
    chatManagerService.addMessage(receivedMessage);
}
