import PeerService from '../../Peer/peer.service';
import { createExistingPeersOffers } from '../../Peer/utils';
import ChatManagerService from '../../Manager/ChatManagerService';
import { injector } from '../../..';

export default async function openConnectionsAsInitiator(self: PeerService, data: string) {
    if (!self.server)
        throw new Error('Server is unreachable');

    const peers = JSON.parse(data.substr(30));

    const chatService: ChatManagerService = injector.get(ChatManagerService);

    if (Object.entries(peers).length) {
        const offers = await createExistingPeersOffers(self, peers, chatService);
        self.server.emit('initiator-offers', offers, self.peerId, self.roomId);
    }
}
