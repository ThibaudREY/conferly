import { Component }                                                   from 'react';
import React                                                           from 'react';
import { FaArrowLeft, FaArrowRight, FaArrowUp, FaAngleRight, FaTimes } from 'react-icons/fa';
import './index.css';

interface NavBarProps {
    className?: string
    path: string
    up: Function
    back: Function
    forward: Function
    escape: Function
    editor: boolean
}

interface NavBarState {
}

export default class NavBar extends Component<NavBarProps, NavBarState> {

    render() {

        const {className, path, up, back, forward, escape, editor} = this.props;

        return editor ? <div className={`${className} file-explorer-navbar editor`}>
            <div className="icon" onClick={_ => escape()}>
                <FaTimes/>
            </div>
        </div> : <div className={`${className} file-explorer-navbar-wrapper`}>

            <div className="file-explorer-navbar">
                <div className="icon" onClick={_ => back()}>
                    <FaArrowLeft/>
                </div>
                <div className="icon" onClick={_ => forward()}>
                    <FaArrowRight/>
                </div>
                <div className="icon" onClick={_ => up()}>
                    <FaArrowUp/>
                </div>
                <div className='file-explorer-navbar-path'>
                    {
                        path.split('/').slice(1).map((dir: string, index: number, array: string[]) =>
                            <div key={dir} className='file-explorer-navbar-path-segment'>
                                <div className="icon path" onClick={_ => {
                                    for (let i = 0; i < array.length - index - 1; i++) {up()}
                                }}>
                                    {dir}
                                </div>
                                {
                                    index !== array.length - 1 ? <div className="sep icon" key={dir + '-sep'}>
                                        <FaAngleRight/>
                                    </div> : null
                                }
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    }
}
