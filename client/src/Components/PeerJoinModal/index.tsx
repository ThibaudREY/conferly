import Modal from "react-awesome-modal";
import React from 'react';
import { injector } from "../..";
import PeerService from "../../Services/Peer/peer.service";
import JoinModalForm from "./PeerJoinModalForm/join-modal-form";

import './index.css';


interface PeerJoinModalProps {
    visible: boolean,
    handleClose: Function
}

interface FormData {
    username: string;
}

class PeerJoinModal extends React.Component<PeerJoinModalProps, {}> {

    private readonly peerService: PeerService;

    constructor(props: PeerJoinModalProps) {
        super(props)
        this.peerService = injector.get(PeerService);
        this.submit = this.submit.bind(this);
    }

    private submit(data: FormData): void {

        this.peerService.username = data.username;

        if (this.peerService.username)
            this.props.handleClose();
    }

    render() {
        return (
            <div className="d-flex flex-column">
                <Modal visible={this.props.visible} width="400" height="300" effect="fadeInUp">
                    <div className="join-modal-header">
                        <h6 className="text-white pt-2">Pick a username !</h6>
                    </div>
                    <div className="join-modal-content p-2">
                        <JoinModalForm submit={this.submit}></JoinModalForm>
                    </div>
                    <div className="join-modal-footer text-center">
                        <h6>Share this link {window.location.href}</h6>
                    </div>
                </Modal>
            </div>
        );
    }
};

export default PeerJoinModal;
