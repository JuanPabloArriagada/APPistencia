import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleEstudiantePage } from './detalle-estudiante.page';

describe('DetalleEstudiantePage', () => {
  let component: DetalleEstudiantePage;
  let fixture: ComponentFixture<DetalleEstudiantePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleEstudiantePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
