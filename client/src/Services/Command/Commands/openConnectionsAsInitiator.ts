import PeerService                   from '../../Peer/peer.service';
import { createExistingPeersOffers } from '../../Peer/utils';

export default async function openConnectionsAsInitiator(self: PeerService, data: string) {
    if (!self.server)
        throw new Error('Server is unreachable');

    const peers = JSON.parse(data.substr(30));

    if (Object.entries(peers).length) {
        const offers = await createExistingPeersOffers(self, peers);
        self.server.emit('initiator-offers', offers, self.peerId, self.roomId);
    }
}
