import React from "react";
import { Component } from "react";
import ToolBarItem from "../../../../Models/toolbar-item.model";
import { FaPlus, FaShareAlt } from 'react-icons/fa';
import { toast } from "react-toastify";

import './index.css';

interface ToolBarItemProps {
    items: ToolBarItem[],
    toggleItem: Function,
}

export default class ToolBarItemComponent extends Component<ToolBarItemProps, {}> {

    private async copyToClipboard() {

        try {
            await navigator.clipboard.writeText(document.location.href);
            toast('Link copied to clipboard !', { type: 'success' })
        } catch (err) {
            toast('Failed copying to clipboard', { type: 'error' })
        }
    }

    render() {

        return (
            <div>
                {this.props.items && this.props.items.map((item: ToolBarItem, index: number) => {
                    return <div key={index} className={item.show ? "toolbar-item-visible" : "toolbar-item text-center"} onClick={() => this.props.toggleItem(index)}>
                        <div className="toolbar-item-icon">
                            {item.icon}
                        </div>
                    </div>

                })}

                <div className="toolbar-item text-center" onClick={() => this.copyToClipboard()}>
                    <div className="toolbar-item-icon">
                        <FaShareAlt />
                    </div>
                </div>
                <div className="toolbar-item text-center">
                    <div className="toolbar-item-icon">
                        <FaPlus />
                    </div>
                </div>
            </div>
        );
    }

}