import { TestBed } from '@angular/core/testing';

import { OrdersManagementService } from './orders-management.service';

describe('OrdersManagementService', () => {
  let service: OrdersManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdersManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
