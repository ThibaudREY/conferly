import React, { Component } from 'react';
import './index.scss';

interface ButtonProps {
    onClick?: Function
    text: string
}

export default class Button extends Component<ButtonProps, {}> {

    render() {

        return (
            <div id="container">
                <button className="learn-more" onClick={() => {if (this.props.onClick) this.props.onClick()}}>
                    <div className="circle">
                        <span className="icon arrow"/>
                    </div>
                    <p className="button-text">{this.props.text}</p>
                </button>
            </div>
        );
    }
}
