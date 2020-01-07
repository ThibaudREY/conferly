import Peer from 'simple-peer';
import freeice from 'freeice';
import PeerService from './peer.service';
import ChatManagerService from '../Manager/ChatManagerService';
import { injector } from '../../index';
import StreamManagerService from '../Manager/stream-manager.service';
import { User } from '../../Models/user.model';

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

export async function createExistingPeersOffers(self: PeerService, peers: { [key: string]: any }, chatService: ChatManagerService) {

    let streamManagerService: StreamManagerService = injector.get(StreamManagerService);

    return Object.fromEntries(await Promise.all(
        Object.entries(peers)
            .filter((set: [string, string]) => set[0] !== self.peerId)
            .map(async (set: [string, Peer.SignalData]) => {

                let peerConnection = new Peer({
                    initiator: true,
                    trickle: false,
                    stream: streamManagerService.currentPeerMediaStream,
                    config: { iceServers: freeice() }
                });

                peerConnection.on('stream', (stream: Promise<MediaStream>) => {
                    streamManagerService.subscribePeerStream(set[0], stream);
                })

                let signalingData = await getSignalingData(peerConnection);
                set.splice(1, 1, signalingData);

                self.peerConnections.set(set[0], { instance: peerConnection, user: new User() });
                self.updateObservable();
                return set
            })
    )
    )
}
