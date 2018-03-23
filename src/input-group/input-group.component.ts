import { CommonModule } from "@angular/common";
import { Component, ContentChild, ContentChildren, ElementRef, HostBinding,
    HostListener, Input, NgModule, QueryList, Renderer2 } from "@angular/core";
import { IgxHintDirective } from "../directives/hint/hint.directive";
import { IgxInputDirective } from "../directives/input/input.directive";
import { IgxLabelDirective } from "../directives/label/label.directive";
import { IgxPrefixDirective } from "../directives/prefix/prefix.directive";
import { IgxSuffixDirective } from "../directives/suffix/suffix.directive";

enum IgxInputGroupType {
    LINE = `line` as any,
    BOX = `box` as any,
    BORDER = `border` as any,
    SEARCH = `search` as any
}

export enum IgxInputGroupState {
    INITIAL,
    VALID,
    INVALID
}

@Component({
    selector: "igx-input-group",
    templateUrl: "input-group.component.html"
})
export class IgxInputGroupComponent {
    private _type = IgxInputGroupType.LINE;

    protected _valid = IgxInputGroupState.INITIAL;

    @HostBinding("class.igx-input-group")
    public defaultClass = true;

    @HostBinding("class.igx-input-group--placeholder")
    public hasPlaceholder = false;

    @HostBinding("class.igx-input-group--required")
    public isRequired = false;

    @HostBinding("class.igx-input-group--focused")
    public isFocused = false;

    @HostBinding("class.igx-input-group--filled")
    public isFilled = false;

    @HostBinding("class.igx-input-group--box")
    public isBox = false;

    @HostBinding("class.igx-input-group--border")
    public isBorder = false;

    @HostBinding("class.igx-input-group--search")
    public isSearch = false;

    @HostBinding("class.igx-input-group--disabled")
    public isDisabled = false;

    @HostBinding("class.igx-input-group--valid")
    public get validClass(): boolean {
        return this.valid === IgxInputGroupState.VALID;
    }

    @HostBinding("class.igx-input-group--invalid")
    public get invalidClass(): boolean {
        return this.valid === IgxInputGroupState.INVALID;
    }

    @HostBinding("class.igx-input-group--warning")
    public hasWarning = false;

    @ContentChildren(IgxHintDirective, { read: IgxHintDirective })
    protected hints: QueryList<IgxHintDirective>;

    @ContentChild(IgxInputDirective, { read: IgxInputDirective })
    protected input: IgxInputDirective;

    @HostListener("click", ["$event"])
    public onClick(event) {
        this.input.focus();
    }

    @Input("type")
    set type(value: string) {
        const type: IgxInputGroupType = (IgxInputGroupType as any)[value];
        if (type !== undefined) {
            this.isBox = this.isBorder = this.isSearch = false;
            switch (type) {
                case IgxInputGroupType.BOX:
                    this.isBox = true;
                    break;
                case IgxInputGroupType.BORDER:
                    this.isBorder = true;
                    break;
                case IgxInputGroupType.SEARCH:
                    this.isSearch = true;
                    break;
                default: break;
            }

            this._type = type;
        }
    }
    get type() {
        return this._type.toString();
    }

    get valid(): IgxInputGroupState {
        return this._valid;
    }

    set valid(value: IgxInputGroupState) {
        this._valid = value;
    }

    constructor(public element: ElementRef, private _renderer: Renderer2) {
    }

    get hasHints() {
        return this.hints.length > 0;
    }

    get hasBorder() {
        return this._type === IgxInputGroupType.LINE ||
            this._type === IgxInputGroupType.BOX;
    }

    get isTypeLine() {
        return  this._type === IgxInputGroupType.LINE;
    }

    get isTypeBox() {
        return this._type === IgxInputGroupType.BOX;
    }

    get isTypeBorder() {
        return this._type === IgxInputGroupType.BORDER;
    }

    get isTypeSearch() {
        return  this._type === IgxInputGroupType.SEARCH;
    }

}

@NgModule({
    declarations: [IgxInputGroupComponent, IgxHintDirective, IgxInputDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective],
    exports: [IgxInputGroupComponent,  IgxHintDirective, IgxInputDirective, IgxLabelDirective, IgxPrefixDirective, IgxSuffixDirective],
    imports: [CommonModule]
})
export class IgxInputGroupModule { }