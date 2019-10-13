import Peer                 from 'simple-peer';
import PeerService from './peer.service';

export async function getSignalingData(peerConnection: Peer.Instance) {
    return new Promise<Peer.SignalData>((resolve, reject) => {
        try {
            if (peerConnection)
                peerConnection.on('signal', data => resolve(data))
        } catch (e) {
            reject(e);
        }
    });
}

export async function createExistingPeersOffers(self: PeerService, peers: { [key: string]: any }) {
    return Object.fromEntries(await Promise.all(
        Object.entries(peers)
            .filter((set: [string, string]) => set[0] !== self.peerId)
            .map(async (set: [string, Peer.SignalData]) => {

                let peerConnection = new Peer({
                    initiator: true,
                    trickle: false
                });

                let signalingData = await getSignalingData(peerConnection);
                set.splice(1, 1, signalingData);

                self.peerConnections.set(set[0], peerConnection);
                self.updateObservable();
                return set
            })
        )
    )
}
