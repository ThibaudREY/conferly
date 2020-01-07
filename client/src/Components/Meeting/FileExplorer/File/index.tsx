import React, { Component, RefObject } from 'react';
import { FaFolder, FaFile }            from 'react-icons/all';
import './index.css';

export interface FileProps {
    isDirectory: boolean
    name: string
    siblings: RefObject<File>[]
    navigate: Function
    show: Function
}

interface FileState {
    selected: boolean
}

export default class File extends Component<FileProps, FileState> {

    readonly state = {
        selected: false
    };

    private select(e: React.MouseEvent<HTMLDivElement>) {
        e.stopPropagation();

        this.props.siblings.forEach(ref => {
            if (ref.current) {
                ref.current!.unselect();
            }
        });

        this.setState({
            selected: true
        })
    }

    public unselect() {
        this.setState({
            selected: false
        })
    }

    render() {

        const {isDirectory, name, navigate, show} = this.props;
        const {selected} = this.state;

        return <div onClick={this.select.bind(this)} onDoubleClick={e => isDirectory ? navigate(e, this) : show(e, this)} className={selected ? 'selected file' : 'file'}>
            {isDirectory ? <FaFolder/> : <FaFile/>}
            <i>{name}</i>
        </div>
    }

}
