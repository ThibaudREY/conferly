import React from "react";
import { Component } from "react";
import ToolBarItem from "../../../Models/toolbar-item.model";
import ToolBarItemComponent from "./ToolbarItem";

import './index.css';

interface ToolBarProps {
    items: ToolBarItem[],
    toggleItem: Function,
}

export default class ToolBar extends Component<ToolBarProps, {}> {

    render() {

        return (
            <div className="toolbar-wrapper d-flex flex-column" >
                <div className="toolbar">
                    <ToolBarItemComponent toggleItem={this.props.toggleItem} items={this.props.items} />
                </div>
            </div >
        )
    }

}