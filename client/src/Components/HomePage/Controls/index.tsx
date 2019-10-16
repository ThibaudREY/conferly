import React, { Component } from 'react';
import './index.css';
import update from 'react-addons-update';
import Button from '../Button';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import PeerService from '../../../Services/Peer/peer.service';
import injector from '../../../injector';

interface ControlsProps extends RouteComponentProps<any> {

}

interface ControlsState {
    showRoom: boolean
    roomId: string
}

class Controls extends Component<ControlsProps, ControlsState> {

    readonly state = {
        showRoom: false,
        roomId: ''
    };

    private readonly peerService: PeerService;

    constructor(props: ControlsProps) {
        super(props);
        this.peerService = injector.get(PeerService);
    }

    private async showRoom() {

        this.setState({
            showRoom: update(this.state.showRoom, { $set: true }),
        });

        if (this.peerService) {
            let roomId = await this.peerService.createRoom();

            this.setState({
                roomId: update(this.state.roomId, { $set: roomId })
            });

            this.props.history.push({
                pathname: `/${roomId}`,
                state: { joined: true }
            })
        }
    }

    render() {
        return (
            <div className='controls'>
                <Button text='START NOW' onClick={() => this.showRoom()} />
            </div>
        );
    }
}

export default withRouter(Controls);
