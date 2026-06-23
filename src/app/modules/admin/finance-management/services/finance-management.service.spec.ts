import { TestBed } from '@angular/core/testing';

import { FinanceManagementService } from './finance-management.service';

describe('FinanceManagementService', () => {
  let service: FinanceManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinanceManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
