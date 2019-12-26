import React from "react";
import { Component } from "react";
import ToolBarItem from "../../../../Models/toolbar-item.model";
import { FaShareAlt, FaTools } from 'react-icons/fa';
import { toast } from "react-toastify";
import { servicesModal } from "../../ServicesModal/index";


import './index.css';

interface ToolBarItemProps {
    items: ToolBarItem[],
    toggleItem: Function,
}

export default class ToolBarItemComponent extends Component<ToolBarItemProps, {}> {

    readonly state = {
        toggleServices: false,
    };

    private async copyToClipboard() {

        try {
            await navigator.clipboard.writeText(document.location.href);
            toast('Link copied to clipboard !', { type: 'success' })
        } catch (err) {
            toast('Failed copying to clipboard', { type: 'error' })
        }
    }

    private toggleServicesKeyModal() {
        servicesModal.next({
            show: true,
            items: this.props.items,
        });
    }

    render() {

        return (
            <div>
                {this.props.items && this.props.items.filter((item: ToolBarItem) => { return !item.lock }).map((item: ToolBarItem, index: number) => {
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
                <div className="toolbar-item text-center" onClick={() => this.toggleServicesKeyModal()}>
                    <div className="toolbar-item-icon">
                        <FaTools />
                    </div>
                </div>
            </div>

        );
    }

}