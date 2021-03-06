import { Component, ViewChildren } from "@angular/core";
import {
    async,
    TestBed
} from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { IgxRadioComponent } from "./radio.component";

describe("IgRadio", () => {

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                InitRadioComponent,
                RadioWithModelComponent,
                IgxRadioComponent
            ],
            imports: [FormsModule]
        })
        .compileComponents();
    }));

    it("Init a radio", () => {
        const fixture = TestBed.createComponent(InitRadioComponent);
        fixture.detectChanges();

        const nativeRadio = fixture.debugElement.query(By.css("input")).nativeElement;
        const nativeLabel = fixture.debugElement.query(By.css("label")).nativeElement;

        expect(nativeRadio).toBeTruthy();
        expect(nativeRadio.type).toBe("radio");
        expect(nativeLabel).toBeTruthy();
        expect(nativeLabel.textContent.trim()).toEqual("Radio");
    });

    it("Binding to ngModel", async(() => {
        const fixture = TestBed.createComponent(RadioWithModelComponent);
        fixture.detectChanges();

        const radios = fixture.componentInstance.radios.toArray();

        expect(radios.length).toEqual(3);

        fixture.whenStable().then(() => {
            fixture.detectChanges();
            expect(radios[0].checked).toBe(true);

            radios[1].nativeRadio.nativeElement.dispatchEvent(new Event("change"));
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(radios[1].checked).toBe(true);
                expect(radios[0].checked).toBe(false);
                expect(fixture.componentInstance.selected).toEqual("Bar");
            });
        });
    }));
});

@Component({ template: `<igx-radio>Radio</igx-radio>` })
class InitRadioComponent {}

@Component({
    template: `
        <igx-radio *ngFor="let item of ['Foo', 'Bar', 'Baz']"
                    value="{{item}}"
                    name="group" [(ngModel)]="selected">{{item}}</igx-radio>`
})
class RadioWithModelComponent {
    @ViewChildren(IgxRadioComponent) public radios;

    public selected = "Foo";
}
