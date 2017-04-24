import {Injectable} from '@angular/core';
import * as moment from 'jalali-moment';
import {Moment} from 'jalali-moment';
import {UtilsService} from '../common/services/utils/utils.service';
import {IMonth} from './month.model';
import {IMonthCalendarConfig} from './month-calendar-config';
import {FormControl} from '@angular/forms';
import {ECalendarSystem} from "../common/types/calendar-type";

@Injectable()
export class MonthCalendarService {

  readonly GREGORIAN_DEFAULT_CONFIG: IMonthCalendarConfig = {
    allowMultiSelect: false,
    yearFormat: 'YYYY',
    format: 'MM-YYYY',
    isNavHeaderBtnClickable: false
  };
  readonly JALALI_DEFAULT_CONFIG: IMonthCalendarConfig = {
    allowMultiSelect: false,
    yearFormat: 'jYYYY',
    format: 'jMMMM-jYYYY',
    isNavHeaderBtnClickable: false
  };
  DEFAULT_CONFIG:IMonthCalendarConfig = this.JALALI_DEFAULT_CONFIG;

  constructor(private utilsService: UtilsService) {
  }
  getMomentMonthFormat(config = this.DEFAULT_CONFIG){
    return (config.calendarSystem!=ECalendarSystem.gregorian)?'jMonth':'month';
  }
  getMomentYearFormat(config = this.DEFAULT_CONFIG){
    return (config.calendarSystem!=ECalendarSystem.gregorian)?'jYear':'year';
  }
  getMonthFormat(config = this.DEFAULT_CONFIG){
    return (config.calendarSystem!=ECalendarSystem.gregorian)?'jMMMM':'MMM';
  }

  getConfig(config: IMonthCalendarConfig): IMonthCalendarConfig {
    this.DEFAULT_CONFIG = (config.calendarSystem!=ECalendarSystem.gregorian)?this.JALALI_DEFAULT_CONFIG:this.GREGORIAN_DEFAULT_CONFIG;
    return {...this.DEFAULT_CONFIG, ...this.utilsService.clearUndefined(config)};
  }

  increaseYear(year: Moment){
    year.add(1, this.getMomentYearFormat());
  }
  decreaseYear(year: Moment){
    year.subtract(1, this.getMomentYearFormat());
  }

  generateYear(year: Moment, selected: Moment[] = null): IMonth[][] {
    const index = year.clone().startOf(this.getMomentYearFormat());
    const monthFormat = this.getMonthFormat();
    const momentMonthFormat = this.getMomentMonthFormat();
    return this.utilsService.createArray(3).map(() => {
      return this.utilsService.createArray(4).map(() => {
        const month = {
          date: index.clone(),
          formatedDate: index.clone().format(monthFormat),
          selected: !!selected.find(s => index.isSame(s, momentMonthFormat)),
          currentMonth: index.isSame(moment(), momentMonthFormat)
        };

        index.add(1, momentMonthFormat);
        return month;
      });
    });
  }

  isMonthDisabled(month: IMonth, config: IMonthCalendarConfig) {
    if (config.min && month.date.isBefore(config.min, this.getMomentMonthFormat(config))) {
      return true;
    }

    return !!(config.max && month.date.isAfter(config.max, this.getMomentMonthFormat(config)));
  }

  createValidator({minDate, maxDate}, dateFormat: string): (FormControl, string) => {[key: string]: any} {
    let isValid: boolean;
    let value: Moment[];
    const validators = [];

    if (minDate) {
      validators.push({
        key: 'minDate',
        isValid: () => {
          const _isValid = value.every(val => val.isSameOrAfter(minDate, this.getMomentMonthFormat()));
          isValid = isValid ? _isValid : false;
          return _isValid;
        }
      });
    }

    if (maxDate) {
      validators.push({
        key: 'maxDate',
        isValid: () => {
          const _isValid = value.every(val => val.isSameOrBefore(maxDate, this.getMomentMonthFormat()));
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

  shouldShowLeft(min: Moment, currentMonthView: Moment): boolean {
    return min ? min.isBefore(currentMonthView, this.getMomentYearFormat()) : true;
  }

  shouldShowRight(max: Moment, currentMonthView: Moment): boolean {
    return max ? max.isAfter(currentMonthView, this.getMomentYearFormat()) : true;
  }

  getHeaderLabel(config: IMonthCalendarConfig, year: Moment): string {
    if (config.yearFormatter) {
      return config.yearFormatter(year);
    }

    return year.format(config.yearFormat);
  }

  updateSelected(config: IMonthCalendarConfig, currentlySelected: Moment[], month: IMonth): Moment[] {
    const isSelected = !month.selected;
    if (config.allowMultiSelect) {
      return isSelected
        ? currentlySelected.concat([month.date])
        : currentlySelected.filter(date => !date.isSame(month.date, this.getMomentMonthFormat(config)));
    } else {
      return isSelected ? [month.date] : [];
    }
  }
}
