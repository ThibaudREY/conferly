import React, { Component }      from 'react';
import Dropzone                    from 'react-dropzone';
import update                      from 'react-addons-update';
import CommandService              from '../../../Services/Command/command.service';
import { Commands }                from '../../../Services/Command/Commands/commands.enum';
import { destinee }                from './file-destinee-modal';
import PeerService                 from '../../../Services/Peer/peer.service';
import { injector }                from '../../../index';
import './index.css';
import FileIcon, { defaultStyles } from "react-file-icon";
import { FaPaperPlane, MdClose }   from 'react-icons/all';

interface FileDropProps {
}

interface FileDropState {
    files: File[]
    sent: boolean
}

export default class FileDrop extends Component<FileDropProps, FileDropState> {

    readonly state = {
        files: new Array<File>(),
        sent: true
    };

    constructor(props: FileDropProps) {
        super(props);
        destinee.subscribe(next => {

            if (next.destinees.length) {
                const peerService: PeerService = injector.get(PeerService);
                const peerId = peerService.peerId;
                this.state.files.forEach(async (file: File) => {
                    CommandService.broadcast(Commands.FILE, JSON.stringify({peerId: peerId, username: peerService.username, filename: file.name, size: file.size, payload: await this.fileToString(file)}), 0, next.destinees)
                });

                this.setState({
                    sent: update(this.state.sent, {$set: true}),
                    files: update(this.state.files, {$set: []})
                });
            }
        });
    }

    private fileToString(file: File) {
        return new Promise<string|ArrayBuffer|null>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    private add(files: File[]) {
        this.setState({
            sent: update(this.state.sent, {$set: false}),
            files: update(this.state.files, {$push: files}),
        });
    }

    private destineeModal() {
        destinee.next({show: true, destinees: []});
    }

    private deleteFile(file: File) {
        this.setState({
            files: update(this.state.files, {$set: this.state.files.filter(f => f !== file)})
        })
    }

    render() {

        const {files, sent} = this.state;

        return (
            <div>
                <Dropzone onDrop={(acceptedFiles: any) => this.add(acceptedFiles)}>
                    {({getRootProps, getInputProps}: any) => (
                        <div className='row'>
                            <div {...getRootProps({className: `dropzone ${!sent ? 'col-9' : 'col-11 fullsize'} ml-3`})}>
                                <input {...getInputProps()} />
                                <p>Drag 'n' drop some files here, or click to select files</p>
                            </div>
                            {!sent ? <div className="col-2 send ml-3" onClick={() => this.destineeModal()}><FaPaperPlane/></div> : ''}
                        </div>
                    )}
                </Dropzone>
                <div className="row ml-0">
                    <ul className="col-12 list-unstyled files p-0 mb-0">
                        {
                            files.map((file: File) => {
                                const extension = file.name.split('.').pop();
                                return (<li key={file.name} className='file'>
                                    <FileIcon extension={extension} {...defaultStyles.docx} size={30}/> {file.name} - {(file.size / 1024).toFixed(2)}kb
                                    <MdClose className='remove-file' onClick={() => this.deleteFile(file)}/>
                                </li>)
                            })
                        }
                    </ul>
                </div>
            </div>
        );
    }
}
