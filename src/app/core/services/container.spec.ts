import { TestBed } from '@angular/core/testing';

import { Container } from './container';

describe('Container', () => {
  let service: Container;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Container);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
