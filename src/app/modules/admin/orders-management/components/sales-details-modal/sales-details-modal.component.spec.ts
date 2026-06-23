import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDetailsModalComponent } from './sales-details-modal.component';

describe('SalesDetailsModalComponent', () => {
  let component: SalesDetailsModalComponent;
  let fixture: ComponentFixture<SalesDetailsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesDetailsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesDetailsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
