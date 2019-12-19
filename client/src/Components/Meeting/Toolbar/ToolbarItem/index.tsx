import React from "react";
import { Component } from "react";
import ToolBarItem from "../../../../Models/toolbar-item.model";
import { FaPlus } from 'react-icons/fa';

import './index.css';

interface ToolBarItemProps {
    items: ToolBarItem[],
    toggleItem: Function,
}

export default class ToolBarItemComponent extends Component<ToolBarItemProps, {}> {

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

                < div className="toolbar-item text-center" >
                    <div className="toolbar-item-icon">
                        <FaPlus />
                    </div>
                </div >
            </div>
        );
    }

}