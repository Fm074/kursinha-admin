import { TestBed } from '@angular/core/testing';

import { SalesManagementService } from './sales-management.service';

describe('SalesManagementService', () => {
  let service: SalesManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
