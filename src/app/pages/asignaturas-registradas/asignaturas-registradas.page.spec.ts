import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignaturasRegistradasPage } from './asignaturas-registradas.page';

describe('AsignaturasRegistradasPage', () => {
  let component: AsignaturasRegistradasPage;
  let fixture: ComponentFixture<AsignaturasRegistradasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignaturasRegistradasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
