/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { DmneditorComponent } from './dmneditor.component';

describe('DmneditorComponent', () => {
  let component: DmneditorComponent;
  let fixture: ComponentFixture<DmneditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DmneditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DmneditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
