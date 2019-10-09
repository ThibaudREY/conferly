import { BehaviorSubject }            from 'rxjs';
import Modal                          from "react-awesome-modal";
import React, { useEffect, useState } from 'react';
import { MdClose, MdError }           from 'react-icons/md';

export const error = new BehaviorSubject({
    show: true,
    message: '',
    acknowledgable: false
});

const ErrorModal: React.FC = () => {

    const [showModal, setShowModal] = useState(false);
    const [message, setMessage] = useState('');
    const [acknowledgable, setAcknowledgable] = useState(false);

    useEffect(() => {
        error.subscribe(error => {
            setShowModal(error.show);
            setMessage(error.message);
            setAcknowledgable(error.acknowledgable);
        });
    });

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <Modal visible={showModal} width="400" height="300" effect="fadeInUp" onClickAway={() => closeModal()}>
            <div className='error-modal-header'>
                <MdError/>
                {
                    acknowledgable ? <MdClose className='error-modal-close' onClick={() => closeModal()}/> : null
                }
            </div>
            <div className='error-modal-message'>
                { message }
            </div>
        </Modal>
    );
};

export default ErrorModal;
