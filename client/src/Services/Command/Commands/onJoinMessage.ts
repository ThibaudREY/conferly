import PeerService        from '../../Peer/peer.service';
import ChatManagerService from '../../Manager/ChatManagerService';
import { injector }       from '../../..';
import ChatMessage        from '../../../Models/chat-message.model';
import SimplePeer         from 'simple-peer';
import { User }           from '../../../Models/user.model';

export default async function onJoinMessage(self: PeerService, data: string) {

    const senderId: string = data.substr(0, 10);
    const receivedMessage: ChatMessage = JSON.parse(data.substr(30));

    const chatManagerService: ChatManagerService = injector.get(ChatManagerService);
    chatManagerService.addMessage(receivedMessage);

    if (self.peerConnections.get(senderId)) {
        let set: { instance: SimplePeer.Instance, user: User } | undefined = self.peerConnections.get(senderId);
        if (set) {
            set.user = new User(receivedMessage.username, receivedMessage.username.substr(0, 3));
            self.peerConnections.set(senderId, set);
            self.updateObservable();
        }
    }
}
