import PeerService from './Services/Peer/peer.service';
import { Container } from 'inversify';
import StreamManagerService from './Services/Manager/StreamManagerService';
import ChatManagerService from './Services/Manager/ChatManagerService';

const DIContainer = new Container();
DIContainer.bind<PeerService>(PeerService).toConstantValue(new PeerService());
DIContainer.bind<StreamManagerService>(StreamManagerService).toConstantValue(new StreamManagerService());
DIContainer.bind<ChatManagerService>(ChatManagerService).toConstantValue(new ChatManagerService());

export { DIContainer };

