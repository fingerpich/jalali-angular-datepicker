import {Injectable} from '@angular/core';
import * as moment from 'jalali-moment';
import {Moment} from 'jalali-moment';
import {WeekDays} from '../common/types/week-days.type';
import {UtilsService} from '../common/services/utils/utils.service';
import {IDay} from './day.model';
import {FormControl} from '@angular/forms';
import {IDayCalendarConfig} from './day-calendar-config.model';
import {IMonthCalendarConfig} from '../month-calendar/month-calendar-config';
import {ECalendarSystem} from "../common/types/calendar-type";
import unitOfTime = moment.unitOfTime;
@Injectable()
export class DayCalendarService {
  readonly DAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
  readonly GREGORIAN_DEFAULT_CONFIG: IDayCalendarConfig = {
    weekdayNames: {
      su: 'sun',
      mo: 'mon',
      tu: 'tue',
      we: 'wed',
      th: 'thu',
      fr: 'fri',
      sa: 'sat'
    },
    showNearMonthDays: true,
    showWeekNumbers: false,
    firstDayOfWeek: 'su',
    format: 'DD-MM-YYYY',
    allowMultiSelect: false,
    monthFormat: 'MMM, YYYY',
    enableMonthSelector: true,
  };
  readonly JALALI_DEFAULT_CONFIG: IDayCalendarConfig = {
    weekdayNames: {
      su: 'ی',
      mo: 'د',
      tu: 'س',
      we: 'چ',
      th: 'پ',
      fr: 'ج',
      sa: 'ش'
    },
    showNearMonthDays: true,
    showWeekNumbers: false,
    firstDayOfWeek: 'sa',
    format: 'jDD-jMM-jYYYY',
    allowMultiSelect: false,
    monthFormat: 'jMMMM, jYYYY',
    enableMonthSelector: true,
  };
  DEFAULT_CONFIG: IDayCalendarConfig = this.JALALI_DEFAULT_CONFIG;

  constructor(private utilsService: UtilsService) {
    moment.loadPersian();
  }

  private getMonthFormat(config=this.DEFAULT_CONFIG):unitOfTime.Base{
    return (config.calendarSystem!=ECalendarSystem.gregorian)?"jMonth":"month";
  }
  private getDayFormat(config=this.DEFAULT_CONFIG):string{
    return (config.calendarSystem!=ECalendarSystem.gregorian)?"jDD":"DD"
  }
  private removeNearMonthWeeks(currentMonth: Moment, monthArray: IDay[][]): IDay[][] {
    if (monthArray[monthArray.length - 1].find((day) => day.date.isSame(currentMonth, this.getMonthFormat()))) {
      return monthArray;
    } else {
      return monthArray.slice(0, -1);
    }
  }

  getConfig(config: IDayCalendarConfig): IDayCalendarConfig {
    this.DEFAULT_CONFIG=(!config || (config.calendarSystem != ECalendarSystem.gregorian))?this.JALALI_DEFAULT_CONFIG:this.GREGORIAN_DEFAULT_CONFIG;
    return {...this.DEFAULT_CONFIG, ...this.utilsService.clearUndefined(config)};
  }

  generateDaysMap(firstDayOfWeek: WeekDays) {
    const firstDayIndex = this.DAYS.indexOf(firstDayOfWeek);
    const daysArr = this.DAYS.slice(firstDayIndex, 7).concat(this.DAYS.slice(0, firstDayIndex));
    return daysArr.reduce((map, day, index) => {
      map[day] = index;
      return map;
    }, <{[key: number]: string}>{});
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
    const actionMonthFormat=this.getMonthFormat(config);
    const actionDayFormat=this.getDayFormat(config);
    const daysOfCalendar: IDay[] = this.utilsService.createArray(42).reduce((array: IDay[]) => {
      array.push({
        date: current.clone(),
        formatedDate: current.clone().format(actionDayFormat),
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

  generateWeekdays(firstDayOfWeek: WeekDays, weekdayNames: {[key: string]: string}): string[] {
    const weekdays: string[] = [];
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

  createValidator({minDate, maxDate}, dateFormat: string): (FormControl, string) => {[key: string]: any} {
    let isValid: boolean;
    let value: Moment[];
    const validators = [];

    if (minDate) {
      validators.push({
        key: 'minDate',
        isValid: () => {
          const _isValid = value.every(val => val.isSameOrAfter(minDate, 'day'));
          isValid = isValid ? _isValid : false;
          return _isValid;
        }
      });
    }

    if (maxDate) {
      validators.push({
        key: 'maxDate',
        isValid: () => {
          const _isValid = value.every(val => val.isSameOrBefore(maxDate, 'day'));
          isValid = isValid ? _isValid : false;
          return _isValid;
        }
      });
    }

    return function validateInput(formControl: FormControl, format: string) {
      isValid = true;

      if (formControl.value) {
        if (typeof formControl.value === 'string') {
          const dateStrings = formControl.value.split(',').map(date => date.trim());
          const validDateStrings = dateStrings
            .filter(date => this.utilsService.isDateValid(date, format));
          value = validDateStrings.map(dateString => moment(dateString, dateFormat));
        } else if (!Array.isArray(formControl.value)) {
          value = [formControl.value];
        } else {
          value = formControl.value.map(val => this.utilsService.convertToMoment(val, dateFormat));
        }
      } else {
        return null;
      }

      if (!value.every(val => val.isValid())) {
        return {
          format: {
            given: formControl.value
          }
        };
      }

      const errors = validators.reduce((map, err) => {
        if (!err.isValid()) {
          map[err.key] = {
            given: value
          };
        }

        return map;
      }, {});

      return !isValid ? errors : null;
    };
  }

  updateSelected(config: IDayCalendarConfig, currentlySelected: Moment[], day: IDay): Moment[] {
    const isSelected = !day.selected;
    if (config.allowMultiSelect) {
      return isSelected
        ? currentlySelected.concat([day.date])
        : currentlySelected.filter(date => !date.isSame(day.date, 'day'));
    } else {
      return isSelected ? [day.date] : [];
    }
  }

  // todo:: add unit tests
  getHeaderLabel(config: IDayCalendarConfig, month: Moment): string {
    if (config.monthFormatter) {
      return config.monthFormatter(month);
    }
    if(config.calendarSystem!=ECalendarSystem.gregorian)month.locale('fa');
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
    }, <{[key: number]: string}>{});
  }

  // todo:: add unit tests
  getMonthCalendarConfig(componentConfig: IDayCalendarConfig): IMonthCalendarConfig {
    return this.utilsService.clearUndefined({
      min: componentConfig.min,
      max: componentConfig.max,
      format: componentConfig.format,
      isNavHeaderBtnClickable: true,
      allowMultiSelect: false,
      yearFormat: componentConfig.yearFormat,
      yearFormatter: componentConfig.yearFormatter
    });
  }
}
