import {EventEmitter, Injectable} from '@angular/core';
import {IDatePickerConfig, IDatePickerConfigInternal} from './date-picker-config.model';
import * as moment from 'jalali-moment';
import {Moment} from 'jalali-moment';
import {UtilsService} from '../common/services/utils/utils.service';
import {IDayCalendarConfig} from '../day-calendar/day-calendar-config.model';
import {TimeSelectService} from '../time-select/time-select.service';
import {DayTimeCalendarService} from '../day-time-calendar/day-time-calendar.service';
import {ITimeSelectConfig} from '../time-select/time-select-config.model';
import {CalendarMode} from '../common/types/calendar-mode';

@Injectable()
export class DatePickerService {
  readonly onPickerClosed: EventEmitter<null> = new EventEmitter();
  private defaultConfig: IDatePickerConfigInternal = {
    closeOnSelect: true,
    closeOnSelectDelay: 100,
    format: 'YYYY-MM-D',
    openOnFocus: true,
    openOnClick: true,
    onOpenDelay: 0,
    disableKeypress: false,
    showNearMonthDays: true,
    showWeekNumbers: false,
    enableMonthSelector: true,
    showGoToCurrent: true,
    locale: 'fa'
  };
  private gregorianExtensionConfig: IDatePickerConfig = {
    format: 'DD-MM-YYYY',
    locale: 'en'
  };
  constructor(private utilsService: UtilsService,
              private timeSelectService: TimeSelectService,
              private daytimeCalendarService: DayTimeCalendarService) {
  }

  // todo:: add unit tests
  getConfig(config: IDatePickerConfig, mode: CalendarMode = 'daytime'): IDatePickerConfigInternal {
    const _config = <IDatePickerConfigInternal>{
      ...this.defaultConfig,
      ...((config && config.locale && config.locale !== 'fa') ? this.gregorianExtensionConfig : {}),
      format: this.getDefaultFormatByMode(mode, config),
      ...this.utilsService.clearUndefined(config)
    };

    this.utilsService.convertPropsToMoment(_config, _config.format, ['min', 'max']);

    if (config && config.allowMultiSelect && config.closeOnSelect === undefined) {
      _config.closeOnSelect = false;
    }

    moment.locale(_config.locale);

    return _config;
  }

  getDayConfigService(pickerConfig: IDatePickerConfig): IDayCalendarConfig {
    return {
      min: pickerConfig.min,
      max: pickerConfig.max,
      isDayDisabledCallback: pickerConfig.isDayDisabledCallback,
      weekDayFormat: pickerConfig.weekDayFormat,
      showNearMonthDays: pickerConfig.showNearMonthDays,
      showWeekNumbers: pickerConfig.showWeekNumbers,
      firstDayOfWeek: pickerConfig.firstDayOfWeek,
      format: pickerConfig.format,
      allowMultiSelect: pickerConfig.allowMultiSelect,
      monthFormat: pickerConfig.monthFormat,
      monthFormatter: pickerConfig.monthFormatter,
      enableMonthSelector: pickerConfig.enableMonthSelector,
      yearFormat: pickerConfig.yearFormat,
      yearFormatter: pickerConfig.yearFormatter,
      dayBtnFormat: pickerConfig.dayBtnFormat,
      dayBtnFormatter: pickerConfig.dayBtnFormatter,
      dayBtnCssClassCallback: pickerConfig.dayBtnCssClassCallback,
      monthBtnFormat: pickerConfig.monthBtnFormat,
      monthBtnFormatter: pickerConfig.monthBtnFormatter,
      monthBtnCssClassCallback: pickerConfig.monthBtnCssClassCallback,
      multipleYearsNavigateBy: pickerConfig.multipleYearsNavigateBy,
      showMultipleYearsNavigation: pickerConfig.showMultipleYearsNavigation,
      locale: pickerConfig.locale,
      returnedValueType: pickerConfig.returnedValueType,
      showGoToCurrent: pickerConfig.showGoToCurrent
    };
  }

  getDayTimeConfigService(pickerConfig: IDatePickerConfig): ITimeSelectConfig {
    return this.daytimeCalendarService.getConfig(pickerConfig);
  }

  getTimeConfigService(pickerConfig: IDatePickerConfig): ITimeSelectConfig {
    return this.timeSelectService.getConfig(pickerConfig);
  }

  pickerClosed() {
    this.onPickerClosed.emit();
  }

  // todo:: add unit tests
  isValidInputDateValue(value: string, config: IDatePickerConfig): boolean {
    value = value ? value : '';
    const datesStrArr: string[] = this.utilsService.datesStringToStringArray(value);

    return datesStrArr.every(date => this.utilsService.isDateValid(date, config.format));
  }

  // todo:: add unit tests
  convertInputValueToMomentArray(value: string, config: IDatePickerConfig): Moment[] {
    value = value ? value : '';
    const datesStrArr: string[] = this.utilsService.datesStringToStringArray(value);

    return this.utilsService.convertToMomentArray(datesStrArr, config.format, config.allowMultiSelect);
  }

  private getDefaultFormatByMode(mode: CalendarMode, config: IDatePickerConfig): string {
    let dateFormat = 'YYYY-MM-DD';
    let monthFormat = 'MMMM YY';
    const timeFormat = 'HH:mm:ss';
    if (config && config.locale && config.locale !== 'fa') {
      dateFormat = 'DD-MM-YYYY';
      monthFormat = 'MMM, YYYY';
    }
    switch (mode) {
      case 'day':
        return dateFormat;
      case 'daytime':
        return dateFormat + ' ' + timeFormat;
      case 'time':
        return timeFormat;
      case 'month':
        return monthFormat;
    }
  }
}
