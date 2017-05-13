import {Moment} from 'jalali-moment';
import {ICalendar} from '../common/models/calendar.model';
import {ECalendarSystem} from '../common/types/calendar-type-enum';

export interface IMonthCalendarConfig extends ICalendar {
  isMonthDisabledCallback?: (date: Moment) => boolean;
  allowMultiSelect?: boolean;
  yearFormat?: string;
  calendarSystem?: ECalendarSystem;
  yearFormatter?: (month: Moment) => string;
  format?: string;
  isNavHeaderBtnClickable?: boolean;
  monthBtnFormat?: string;
  monthBtnFormatter?: (day: Moment) => string;
}
