import PeerService from './Services/PeerService';
import { Container }                 from 'inversify';

const DIContainer = new Container();
DIContainer.bind<PeerService>(PeerService).toConstantValue(new PeerService());

export default DIContainer;

