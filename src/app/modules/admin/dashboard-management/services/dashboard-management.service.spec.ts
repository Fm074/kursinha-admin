import { TestBed } from '@angular/core/testing';

import { DashboardManagementService } from './dashboard-management.service';

describe('DashboardManagementService', () => {
  let service: DashboardManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
