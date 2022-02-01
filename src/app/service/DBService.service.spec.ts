/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { DBServiceService } from './DBService.service';

describe('Service: DBService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DBServiceService]
    });
  });

  it('should ...', inject([DBServiceService], (service: DBServiceService) => {
    expect(service).toBeTruthy();
  }));
});
