// Type definitions for @ag-community/grid-core v21.2.2
// Project: http://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
import { AgCheckbox } from "./agCheckbox";
export declare class AgRadioButton extends AgCheckbox {
    protected className: string;
    protected inputType: string;
    protected iconMap: {
        selected: string;
        unselected: string;
    };
    toggle(): void;
    protected getIconName(): string;
}