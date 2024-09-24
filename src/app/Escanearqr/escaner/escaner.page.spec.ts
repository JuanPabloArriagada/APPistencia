import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscanerPage } from './escaner.page';

describe('EscanerPage', () => {
  let component: EscanerPage;
  let fixture: ComponentFixture<EscanerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EscanerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
