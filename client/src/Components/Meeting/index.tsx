import React, { Component }        from 'react';
import PeerService, { subscriber } from '../../Services/Peer/peer.service';
import DIContainer                 from '../../ioc';
import SimplePeer                  from 'simple-peer';
import { Subscription }            from 'rxjs';
import update                      from 'react-addons-update';

interface MeetingProps {
    match: any
    location: any
}

interface MeetingState {
    joined: boolean
    peerConnections: Map<string, SimplePeer.Instance>
}

export default class Meeting extends Component<MeetingProps, MeetingState> {

    readonly state = {
        joined: false,
        peerConnections: new Map()
    };

    private peerService: PeerService = DIContainer.resolve(PeerService);
    private subscription?: Subscription;

    async componentDidMount(): Promise<void> {

        this.subscription = subscriber.subscribe(
            (peerConnections: Map<string, SimplePeer.Instance>) => {
                if (peerConnections) {
                    this.setState({
                        peerConnections: update(this.state.peerConnections, {$set: peerConnections})
                    });
                }

            });

        const {roomId} = this.props.match.params;

        if ((this.props.location.state && !this.props.location.state.joined) || !this.props.location.state)
            await this.peerService.joinRoom(roomId)
    }

    render() {

        const {peerConnections} = this.state;

        return (
            <div>
                Meeting works !
                <ul>
                    {
                        Array.from(peerConnections.entries()).map((value: [string, SimplePeer.Instance]) => {
                            return <li key={value[0]}>{value[0]}</li>
                        })
                    }
                </ul>
            </div>
        );
    }
}
