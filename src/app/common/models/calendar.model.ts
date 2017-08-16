import {locale, Moment} from 'jalali-moment';

export interface ICalendar {
  locale?: string;
  min?: Moment;
  max?: Moment;
}
