import React, { Component } from 'react';
import './index.scss';

interface ButtonProps {
    onClick?: Function
    text: string
}

export default class Button extends Component<ButtonProps, {}> {

    render() {

        return (
            <button type="button" className="btn btn-primary" onClick={() => { if (this.props.onClick) this.props.onClick() }}>
                {this.props.text}
            </button>
        );
    }
}
