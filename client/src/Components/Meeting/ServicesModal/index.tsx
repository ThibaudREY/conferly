import React, { useEffect, useState } from 'react';
import Modal from "react-awesome-modal";
import { BehaviorSubject } from 'rxjs';
import { MdClose } from 'react-icons/md';
import ToolBarItem from '../../../Models/toolbar-item.model';
import './index.css';
import ServicesModalForm from './ServicesModalForm/services-modal-form';
import { injector } from '../../..';
import CommandService from '../../../Services/Command/command.service';
import { Commands } from '../../../Services/Command/Commands/commands.enum';
import AppService from '../../../Services/Manager/app-service.service';

export const servicesModal = new BehaviorSubject({
    show: false,
    items: new Array<ToolBarItem>(),
});

interface FormData {
    token: string;
    appKey: string;
}

const ServicesKeyModal: React.FC = () => {

    const [showModal, setShowModal] = useState(false);
    const [items, setItems] = useState(new Array<ToolBarItem>());

    const commandService: CommandService = injector.get(CommandService);
    const appService: AppService = injector.get(AppService);

    useEffect(() => {
        servicesModal.subscribe(services => {
            setShowModal(services.show);
            setItems(services.items);
        });
    });

    const closeModal = () => {
        servicesModal.next({
            show: false,
            items: [],
        });
    };

    const submit = (data: FormData) => {

        const item = items.find((item: ToolBarItem) => { return item.name === data.appKey });

        appService.saveOrUpdateService(data.appKey, data.token, item!.name);

        const service = { name: item!.label, appKey: data.appKey, token: data.token };

        commandService.broadcast(Commands.SERVICE_UPDATE, JSON.stringify(service));

        servicesModal.next({
            show: false,
            items: items,
        });
    }

    return (

        <Modal visible={showModal} width="600" height="400" effect="fadeInUp">
            <div className='services-modal-header'>
                <MdClose className='services-modal-header-close' onClick={() => closeModal()} />
                Add new services to conference
            </div>
            <div className='services-modal-body'>
                <div className='services container'>
                    {
                        items && Array.from(items).map((item: ToolBarItem, index: number) => {
                            if (item.service) {
                                return (
                                    <div className="row mt-3" key={index}>
                                        <div className="col-2 mx-auto text-center services-item-icon">
                                            {item.icon}
                                        </div>
                                        <div className="col-10 services-item-form">
                                            <ServicesModalForm item={item} submit={submit} />
                                        </div>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>
        </Modal>
    );
};

export default ServicesKeyModal;
