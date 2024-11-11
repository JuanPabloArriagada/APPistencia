import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClasesRegistradasPage } from './clases-registradas.page';

describe('ClasesRegistradasPage', () => {
  let component: ClasesRegistradasPage;
  let fixture: ComponentFixture<ClasesRegistradasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ClasesRegistradasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
