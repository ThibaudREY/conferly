import PeerService from './Services/Peer/peer.service';
import { Container } from 'inversify';
import StreamManagerService from './Services/Manager/StreamManagerService';

const DIContainer = new Container();
DIContainer.bind<PeerService>(PeerService).toConstantValue(new PeerService());
DIContainer.bind<StreamManagerService>(StreamManagerService).toConstantValue(new StreamManagerService());

export { DIContainer };

