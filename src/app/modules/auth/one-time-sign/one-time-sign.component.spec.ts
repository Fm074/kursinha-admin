import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneTimeSignComponent } from './one-time-sign.component';

describe('OneTimeSignComponent', () => {
  let component: OneTimeSignComponent;
  let fixture: ComponentFixture<OneTimeSignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OneTimeSignComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneTimeSignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
