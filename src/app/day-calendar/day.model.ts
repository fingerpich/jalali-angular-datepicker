import {Moment} from 'jalali-moment';

export interface IDay {
  date: Moment;
  formatedDate: string;
  selected?: boolean;
  currentMonth?: boolean;
  prevMonth?: boolean;
  nextMonth?: boolean;
  currentDay?: boolean;
}

export interface IDayEvent {
  day: IDay;
  event: MouseEvent;
}
