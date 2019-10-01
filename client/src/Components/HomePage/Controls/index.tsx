import React, { Component } from 'react';
import './index.css';
import update               from 'react-addons-update';
import { BounceLoader }     from 'react-spinners';
import {
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    EmailShareButton,
    FacebookIcon,
    LinkedinIcon,
    TwitterIcon,
    WhatsappIcon,
    EmailIcon,
}                           from 'react-share';
import Button               from '../Button';
import { Link }             from 'react-router-dom';
import PeerService          from '../../../Services/PeerService';
import DIContainer          from '../../../ioc';

interface ControlsState {
    showRoom: boolean
    roomId: string
}

export default class Controls extends Component<{}, ControlsState> {

    readonly state = {
        showRoom: false,
        roomId: ''
    };

    private readonly peerService: PeerService = DIContainer.resolve(PeerService);

    private async showRoom() {

        this.setState({
            showRoom: update(this.state.showRoom, {$set: true}),
        });

        if (this.peerService) {
            let roomId = await this.peerService.createRoom();

            this.setState({
                roomId: update(this.state.roomId, {$set: roomId})
            });
        }
    }

    render() {

        const {showRoom, roomId} = this.state;

        return (
            <div className='controls'>
                {
                    !showRoom ? <div className='controls'>
                            <Button text='Create a room' onClick={() => this.showRoom()}/>
                        </div> :
                        <BounceLoader
                            sizeUnit={"px"}
                            size={150}
                            color={'#ED554A'}
                            loading={this.state.roomId.length === 0}
                        />
                }

                {
                    this.state.roomId.length ? <div>
                        <Link to={{
                            pathname: `/${roomId}`,
                            state: {
                                joined: true
                            }
                        }}>
                            <Button text='Join this room'/>
                        </Link>
                        <div className='link'>
                            <p>https://conferly.ovh/{roomId}</p>
                            <div className='share'>
                                <FacebookShareButton url={`https://conferly.ovh/${roomId}`}>
                                    <div className="share-icon"><FacebookIcon size={60} round/></div>
                                </FacebookShareButton>
                                <LinkedinShareButton url={`https://conferly.ovh/${roomId}`}>
                                    <div className="share-icon"><LinkedinIcon size={60} round/></div>
                                </LinkedinShareButton>
                                <TwitterShareButton url={`https://conferly.ovh/${roomId}`}>
                                    <div className="share-icon"><TwitterIcon size={60} round/></div>
                                </TwitterShareButton>
                                <WhatsappShareButton url={`https://conferly.ovh/${roomId}`}>
                                    <div className="share-icon"><WhatsappIcon size={60} round/></div>
                                </WhatsappShareButton>
                                <EmailShareButton url={`https://conferly.ovh/${roomId}`}>
                                    <div className="share-icon"><EmailIcon size={60} round/></div>
                                </EmailShareButton>
                            </div>
                        </div>
                    </div> : null
                }
            </div>
        );
    }
}
