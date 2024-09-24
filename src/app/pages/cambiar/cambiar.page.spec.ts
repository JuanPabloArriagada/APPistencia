import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CambiarPage } from './cambiar.page';

describe('CambiarPage', () => {
  let component: CambiarPage;
  let fixture: ComponentFixture<CambiarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CambiarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
