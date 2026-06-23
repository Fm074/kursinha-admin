import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmUserStatusModalComponent } from './confirm-user-status-modal.component';

describe('ConfirmUserStatusModalComponent', () => {
  let component: ConfirmUserStatusModalComponent;
  let fixture: ComponentFixture<ConfirmUserStatusModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmUserStatusModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmUserStatusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
