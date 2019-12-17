import 'reflect-metadata';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ReflectiveInjector } from 'injection-js';
import PeerService from './Services/Peer/peer.service';
import StreamManagerService from './Services/Manager/stream-manager.service';
import CommandService from './Services/Command/command.service';
import ChatManagerService from './Services/Manager/ChatManagerService';

export const injector = ReflectiveInjector.resolveAndCreate([
    CommandService,
    PeerService,
    StreamManagerService,
    ChatManagerService,
])

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
