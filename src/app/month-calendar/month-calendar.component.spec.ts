import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MonthCalendarComponent} from './month-calendar.component';
import {UtilsService} from '../common/services/utils/utils.service';
import {CalendarNavComponent} from '../calendar-nav/calendar-nav.component';
import {MonthCalendarService} from './month-calendar.service';
import * as moment from 'jalali-moment';
import {Moment, unitOfTime} from 'jalali-moment';
import {ECalendarSystem} from '../common/types/calendar-type-enum';

describe('Component: MonthCalendarComponent', () => {
  let component: MonthCalendarComponent;
  let fixture: ComponentFixture<MonthCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MonthCalendarComponent, CalendarNavComponent],
      providers: [MonthCalendarService, UtilsService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthCalendarComponent);
    component = fixture.componentInstance;
    component.config = component.monthCalendarService.getConfig({calendarSystem : ECalendarSystem.gregorian});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should check getMonthBtnText default value', () => {
    expect(component.getMonthBtnText({
      date: moment('05-04-2017', 'DD-MM-YYYY')
    })).toEqual('Apr');
  });
});
