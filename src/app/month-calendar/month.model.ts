import {Moment} from 'jalali-moment';

export interface IMonth {
  date: Moment;
  selected?: boolean;
  currentMonth?: boolean;
}