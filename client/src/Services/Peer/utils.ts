import Peer from 'simple-peer';
import PeerService from './peer.service';
import ChatManagerService from '../Manager/ChatManagerService';
import ChatMessage from '../../Models/chat-message.model';
import { MessageType } from '../../Enums/message-type.enum';
import { Commands } from '../Command/Commands/commands.enum';

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

                peerConnection.on('connect', () => {
                    const helloMessage = new ChatMessage(self.peerId, `${self.peerId} has joined the conference`, MessageType.STATUS_MESSAGE);
                    peerConnection.send(`${self.peerId}${Commands.JOIN_MESSAGE}${JSON.stringify(helloMessage)}`);
                    chatService.addMessage(helloMessage);
                });

                self.peerConnections.set(set[0], peerConnection);
                self.updateObservable();
                return set
            })
    )
    )
}
