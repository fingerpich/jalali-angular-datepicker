import {Injectable} from '@angular/core';
import * as moment from 'jalali-moment';
import {Moment, unitOfTime} from 'jalali-moment';
import {UtilsService} from '../common/services/utils/utils.service';
import {IMonth} from './month.model';
import {IMonthCalendarConfig} from './month-calendar-config';
import {ECalendarSystem} from '../common/types/calendar-type-enum';

@Injectable()
export class MonthCalendarService {

  readonly GREGORIAN_DEFAULT_CONFIG: IMonthCalendarConfig = {
    allowMultiSelect: false,
    yearFormat: 'YYYY',
    format: 'MM-YYYY',
    isNavHeaderBtnClickable: false,
    monthBtnFormat: 'MMM',
    locale: 'en',
    multipleYearsNavigateBy: 10,
    showMultipleYearsNavigation: false
  };
  readonly JALALI_DEFAULT_CONFIG: IMonthCalendarConfig = {
    yearFormat: 'jYYYY',
    format: 'jMMMM-jYYYY',
    monthBtnFormat: 'jMMMM',
    locale: 'fa'
  };
  DEFAULT_CONFIG: IMonthCalendarConfig = {...this.GREGORIAN_DEFAULT_CONFIG , ...this.JALALI_DEFAULT_CONFIG};

  constructor(private utilsService: UtilsService) {
  }
  getMomentMonthFormat(config = this.DEFAULT_CONFIG): unitOfTime.Base {
    return (config.calendarSystem !== ECalendarSystem.gregorian) ? 'jMonth' : 'month';
  }
  getMomentYearFormat(config = this.DEFAULT_CONFIG): unitOfTime.Base {
    return (config.calendarSystem !== ECalendarSystem.gregorian) ? 'jYear' : 'year';
  }

  getConfig(config: IMonthCalendarConfig): IMonthCalendarConfig {
    this.DEFAULT_CONFIG = (config.calendarSystem !== ECalendarSystem.gregorian) ?
        this.JALALI_DEFAULT_CONFIG : this.GREGORIAN_DEFAULT_CONFIG;
    moment.locale(this.DEFAULT_CONFIG.locale);
    return {...this.DEFAULT_CONFIG, ...this.utilsService.clearUndefined(config)};
  }

  increaseYear(year: Moment) {
    year.add(1, this.getMomentYearFormat());
  }
  decreaseYear(year: Moment) {
    year.subtract(1, this.getMomentYearFormat());
  }

  generateYear(year: Moment, selected: Moment[] = null): IMonth[][] {
    const index = year.clone().startOf(this.getMomentYearFormat());
    const momentMonthFormat = this.getMomentMonthFormat();
    return this.utilsService.createArray(3).map(() => {
      return this.utilsService.createArray(4).map(() => {
        const month = {
          date: index.clone(),
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
    year.locale(config.locale);
    return year.format(config.yearFormat);
  }

  getMonthBtnText(config: IMonthCalendarConfig, month: Moment) {
    if (config.monthBtnFormatter) {
      return config.monthBtnFormatter(month);
    }

    return month.format(config.monthBtnFormat);
  }
}
