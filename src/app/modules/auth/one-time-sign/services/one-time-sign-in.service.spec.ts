import { TestBed } from '@angular/core/testing';

import { OneTimeSignInService } from './one-time-sign-in.service';

describe('OneTimeSignInService', () => {
  let service: OneTimeSignInService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OneTimeSignInService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
