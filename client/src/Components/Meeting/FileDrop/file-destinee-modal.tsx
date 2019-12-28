import { BehaviorSubject } from 'rxjs';
import Modal from "react-awesome-modal";
import React, { ChangeEvent, useEffect, useState } from 'react';
import { peers } from '../../../Services/Peer/peer.service';
import SimplePeer from 'simple-peer';
import './index.css';
import { FaCheck, FaPaperPlane, MdClose } from 'react-icons/all';
import { toast } from 'react-toastify';
import { User } from '../../../Models/user.model';


export const destinee = new BehaviorSubject({
    show: false,
    destinees: new Array<string>()
});

const DestineeModal: React.FC = () => {

    const [showModal, setShowModal] = useState(false);
    const [destinees, setDestinees] = useState(new Array<string>());
    const [targets, setTargets] = useState(new Array<HTMLInputElement>());

    useEffect(() => {
        destinee.subscribe(error => {
            setShowModal(error.show);
        });
    });

    const closeModal = () => {
        destinee.next({
            destinees: [],
            show: false
        })
    };

    const send = () => {
        targets.forEach((target: HTMLInputElement) => target.checked = false);
        setTargets([]);

        destinee.next({
            show: false,
            destinees: destinees
        });

        setDestinees([]);

        toast("File(s) sent !");
    };

    const addDestinee = (e: ChangeEvent<HTMLInputElement>, peerId: string) => {
        e.persist();

        targets.push(e.target);
        setTargets(targets);

        if (e.target.checked) {
            destinees.push(peerId);
            setDestinees(destinees);
        } else {
            setDestinees(destinees.splice(destinees.indexOf(peerId), 1))
        }
    };

    return (
        <Modal visible={showModal} width="400" height="300" effect="fadeInUp" onClickAway={() => closeModal()}>
            <div className='destinee-modal-header'>
                <MdClose className='error-modal-close' onClick={() => closeModal()} />
                Send these file(s) to...
            </div>
            <div className='container row ml-2'>
                {
                    Array.from(peers.value.entries()).map((entry: [string, { instance: SimplePeer.Instance, user: User }]) => {
                        return <div className="col-6 mt-3 checkbox" key={entry[0]}>
                            <input type="checkbox" id={entry[0]} onChange={e => addDestinee(e, entry[0])} />
                            <label htmlFor={entry[0]} onClick={e => e.stopPropagation()}>
                                <div><FaCheck /></div>
                                {entry[1].user.username}
                            </label>
                        </div>
                    })
                }
            </div>
            <div className='destinee-modal-footer'>
                <button className='btn btn-primary' onClick={() => send()}><FaPaperPlane /> Send</button>
            </div>
        </Modal>
    );
};

export default DestineeModal;
