import { ReflectiveInjector } from 'injection-js';
import PeerService from './Services/Peer/peer.service';
import StreamManagerService from './Services/Manager/StreamManagerService';

const injector = ReflectiveInjector.resolveAndCreate([
    PeerService,
    StreamManagerService
])

export default injector;