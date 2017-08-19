import {Injectable} from '@angular/core';
import * as moment from 'jalali-moment';
import {Moment, unitOfTime} from 'jalali-moment';
import {WeekDays} from '../common/types/week-days.type';
import {UtilsService} from '../common/services/utils/utils.service';
import {IDay} from './day.model';
import {IDayCalendarConfig} from './day-calendar-config.model';
import {IMonthCalendarConfig} from '../month-calendar/month-calendar-config';
import {ECalendarSystem} from '../common/types/calendar-type-enum';
@Injectable()
export class DayCalendarService {
  private readonly DAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
  readonly GREGORIAN_DEFAULT_CONFIG: IDayCalendarConfig = {
    showNearMonthDays: true,
    showWeekNumbers: false,
    firstDayOfWeek: 'su',
    weekDayFormat: 'ddd',
    format: 'DD-MM-YYYY',
    allowMultiSelect: false,
    monthFormat: 'MMM, YYYY',
    enableMonthSelector: true,
    locale: 'en',
    dayBtnFormat: 'DD'
  };
  readonly JALALI_DEFAULT_CONFIG: IDayCalendarConfig = {
    showNearMonthDays: true,
    showWeekNumbers: false,
    firstDayOfWeek: 'sa',
    weekDayFormat: 'dd',
    format: 'jYYYY/jM/jD',
    allowMultiSelect: false,
    monthFormat: 'jMMMM jYY',
    enableMonthSelector: true,
    locale: 'fa',
    dayBtnFormat: 'jD'
  };
  DEFAULT_CONFIG: IDayCalendarConfig = this.JALALI_DEFAULT_CONFIG;

  constructor(private utilsService: UtilsService) {
  }

  private getMonthFormat(config = this.DEFAULT_CONFIG): unitOfTime.Base {
    return (config.calendarSystem !== ECalendarSystem.gregorian) ? 'jMonth' : 'month';
  }
  private removeNearMonthWeeks(currentMonth: Moment, monthArray: IDay[][]): IDay[][] {
    if (monthArray[monthArray.length - 1].find((day) => day.date.isSame(currentMonth, this.getMonthFormat()))) {
      return monthArray;
    } else {
      return monthArray.slice(0, -1);
    }
  }

  getConfig(config: IDayCalendarConfig): IDayCalendarConfig {
    if (!config || (config.calendarSystem !== ECalendarSystem.gregorian)) {
      moment.loadPersian(false);
      this.DEFAULT_CONFIG = this.JALALI_DEFAULT_CONFIG;
    } else {
      this.DEFAULT_CONFIG = this.GREGORIAN_DEFAULT_CONFIG;
      moment.unloadPersian();
    }
    moment.locale(this.DEFAULT_CONFIG.locale);
    return {...this.DEFAULT_CONFIG, ...this.utilsService.clearUndefined(config)};
  }

  generateDaysMap(firstDayOfWeek: WeekDays) {
    const firstDayIndex = this.DAYS.indexOf(firstDayOfWeek);
    const daysArr = this.DAYS.slice(firstDayIndex, 7).concat(this.DAYS.slice(0, firstDayIndex));
    return daysArr.reduce((map, day, index) => {
      map[day] = index;
      return map;
    }, <{[key:  string]: number}>{});
  }

  generateMonthArray(config: IDayCalendarConfig, month: Moment, selected: Moment[]): IDay[][] {
    let monthArray: IDay[][] = [];
    const firstDayOfMonth = month.clone().startOf(this.getMonthFormat(config));
    const firstDayOfWeekIndex = this.DAYS.indexOf(config.firstDayOfWeek);

    const firstDayOfBoard = firstDayOfMonth;

    while (firstDayOfBoard.day() !== firstDayOfWeekIndex) {
      firstDayOfBoard.subtract(1, 'day');
    }

    const current = firstDayOfBoard.clone();
    const actionMonthFormat = this.getMonthFormat(config);
    const daysOfCalendar: IDay[] = this.utilsService.createArray(42).reduce((array: IDay[]) => {
      array.push({
        date: current.clone(),
        selected: !!selected.find(selectedDay => current.isSame(selectedDay, 'day')),
        currentMonth: current.isSame(month, actionMonthFormat),
        prevMonth: current.isSame(month.clone().subtract(1, actionMonthFormat), actionMonthFormat),
        nextMonth: current.isSame(month.clone().add(1, actionMonthFormat), actionMonthFormat),
        currentDay: current.isSame(moment(), 'day')
      });
      current.add(1, 'd');
      return array;
    }, []);

    daysOfCalendar.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7);

      if (!monthArray[weekIndex]) {
        monthArray.push([]);
      }

      monthArray[weekIndex].push(day);
    });

    if (!config.showNearMonthDays) {
      monthArray = this.removeNearMonthWeeks(month, monthArray);
    }

    return monthArray;
  }

  generateWeekdays(firstDayOfWeek: WeekDays): Moment[] {
    const weekdayNames: {[key: string]: Moment} = {
      su: moment().day(0),
      mo: moment().day(1),
      tu: moment().day(2),
      we: moment().day(3),
      th: moment().day(4),
      fr: moment().day(5),
      sa: moment().day(6)
    };
    const weekdays: Moment[] = [];
    const daysMap = this.generateDaysMap(firstDayOfWeek);

    for (const dayKey in daysMap) {
      if (daysMap.hasOwnProperty(dayKey)) {
        weekdays[daysMap[dayKey]] = weekdayNames[dayKey];
      }
    }

    return weekdays;
  }

  isDateDisabled(day: IDay, config: IDayCalendarConfig): boolean {
    if (config.isDayDisabledCallback) {
      return config.isDayDisabledCallback(day.date);
    }

    if (config.min && day.date.isBefore(config.min, 'day')) {
      return true;
    }

    return !!(config.max && day.date.isAfter(config.max, 'day'));
  }

  // todo:: add unit tests
  getHeaderLabel(config: IDayCalendarConfig, month: Moment): string {
    if (config.monthFormatter) {
      return config.monthFormatter(month);
    }
    if (config.calendarSystem !== ECalendarSystem.gregorian) {
      month.locale('fa');
    }
    return month.format(config.monthFormat);
  }

  // todo:: add unit tests
  shouldShowLeft(min: Moment, currentMonthView: Moment): boolean {
    return min ? min.isBefore(currentMonthView, this.getMonthFormat()) : true;
  }

  // todo:: add unit tests
  shouldShowRight(max: Moment, currentMonthView: Moment): boolean {
    return max ? max.isAfter(currentMonthView, this.getMonthFormat()) : true;
  }

  generateDaysIndexMap(firstDayOfWeek: WeekDays) {
    const firstDayIndex = this.DAYS.indexOf(firstDayOfWeek);
    const daysArr = this.DAYS.slice(firstDayIndex, 7).concat(this.DAYS.slice(0, firstDayIndex));
    return daysArr.reduce((map, day, index) => {
      map[index] = day;
      return map;
    }, <{ [key: number]: string }>{});
  }

  // todo:: add unit tests
  getMonthCalendarConfig(componentConfig: IDayCalendarConfig): IMonthCalendarConfig {
    return this.utilsService.clearUndefined({
      min: componentConfig.min,
      max: componentConfig.max,
      format: componentConfig.format,
      calendarSystem: componentConfig.calendarSystem,
      isNavHeaderBtnClickable: true,
      allowMultiSelect: false,
      yearFormat: componentConfig.yearFormat,
      yearFormatter: componentConfig.yearFormatter,
      monthBtnFormat: componentConfig.monthBtnFormat,
      monthBtnFormatter: componentConfig.monthBtnFormatter,
      multipleYearsNavigateBy: componentConfig.multipleYearsNavigateBy,
      showMultipleYearsNavigation: componentConfig.showMultipleYearsNavigation
    });
  }

  getDayBtnText(config: IDayCalendarConfig, day: Moment): any {
    return config.dayBtnFormatter ?
      config.dayBtnFormatter(day) :
      day.format(config.dayBtnFormat);
  }
}
