import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalcPreviewComponent } from './calc-preview.component';


describe('CalcPreviewCompoent', () => {
  let component: CalcPreviewComponent;
  let fixture: ComponentFixture<CalcPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalcPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalcPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
