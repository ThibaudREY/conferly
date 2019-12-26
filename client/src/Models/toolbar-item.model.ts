export default class ToolBarItem {

    public name: string;
    public label: string;
    public icon: any;
    public lock: boolean;
    public show: boolean;
    public sticky: boolean;

    constructor(name: string, label: string, icon: any, lock: boolean, show: boolean, sticky: boolean) {
        this.name = name;
        this.label = label;
        this.icon = icon;
        this.lock = lock;
        this.show = show;
        this.sticky = sticky;
    }

}
