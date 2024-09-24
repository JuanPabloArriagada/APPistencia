import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenerarQRPage } from './generar-qr.page';

describe('GenerarQRPage', () => {
  let component: GenerarQRPage;
  let fixture: ComponentFixture<GenerarQRPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerarQRPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
