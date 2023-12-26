import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalpagosComponent } from './modalpagos.component';

describe('ModalpagosComponent', () => {
  let component: ModalpagosComponent;
  let fixture: ComponentFixture<ModalpagosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalpagosComponent]
    });
    fixture = TestBed.createComponent(ModalpagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
