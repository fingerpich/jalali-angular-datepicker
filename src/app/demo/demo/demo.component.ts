import {Component, ViewChild, HostListener} from '@angular/core';
import {DatePickerComponent} from '../../date-picker/date-picker.component';
import * as moment from 'jalali-moment';
import {Moment} from 'jalali-moment';
import {IDatePickerConfig} from '../../date-picker/date-picker-config.model';
import debounce from '../../common/decorators/decorators';
import {DayCalendarComponent} from '../../day-calendar/day-calendar.component';
import {ECalendarSystem} from "../../common/types/calendar-type";

@Component({
  selector: 'dp-demo',
  templateUrl: './demo.component.html',
  entryComponents: [DatePickerComponent],
  styleUrls: ['./demo.component.less']
})
export class DemoComponent {
  @ViewChild('datePicker') datePicker: DatePickerComponent;
  readonly DAYS = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'];
  pickerMode = 'dayPicker';

  date: Moment;
  dates: Moment[] = [];

  material: boolean = true;
  required: boolean = false;
  disabled: boolean = false;
  validationMinDate: Moment;
  validationMaxDate: Moment;
  placeholder: string = 'Choose a date...';
  jalaliSystemDefaults:IDatePickerConfig = {
    firstDayOfWeek: 'sa',
    format: 'jDD-jMM-jYYYY',
    monthFormat: 'jMMMM, jYYYY',
    weekdayNames: {
      su: 'ی',
      mo: 'د',
      tu: 'س',
      we: 'چ',
      th: 'پ',
      fr: 'ج',
      sa: 'ش'
    },
    yearFormat: 'jYYYY',
    dayBtnFormat: 'jDD',
    monthBtnFormat: 'jMMMM',
  };
  gregorianSystemDefaults:IDatePickerConfig = {
    firstDayOfWeek: 'su',
    format: 'DD-MM-YYYY',
    monthFormat: 'MMMM, YYYY',
    weekdayNames: {
      su: 'sun',
      mo: 'mon',
      tu: 'tue',
      we: 'wed',
      th: 'thu',
      fr: 'fri',
      sa: 'sat'
    },
    yearFormat: 'YYYY',
    dayBtnFormat: 'DD',
    monthBtnFormat: 'MMM',
  };
  dpconfig: IDatePickerConfig = {
    disableKeypress: false,
    allowMultiSelect: false,
    closeOnSelect: undefined,
    closeOnSelectDelay: 100,
    onOpenDelay: 0,
    appendTo: document.body,
    drops: 'down',
    opens: 'right',
    showNearMonthDays: true,
    showWeekNumbers: false,
    enableMonthSelector: true,
    showGoToCurrent: true,
    calendarSystem: ECalendarSystem.jalali
  };
  config:IDatePickerConfig ={...this.dpconfig, ...this.jalaliSystemDefaults};
  isAtTop: boolean = true;

  @HostListener('document:scroll')
  @debounce(100)
  updateIsAtTop() {
    this.isAtTop = document.body.scrollTop === 0;
  }

  changeCalendarSystem() {
    const defaultCalSys=(this.config.calendarSystem==ECalendarSystem.jalali)?this.jalaliSystemDefaults:this.gregorianSystemDefaults;
    this.date = moment();
    this.config = {...this.config, ...defaultCalSys};
  }

  configChanged() {
    this.config = {...this.config};
  };


  openCalendar() {
    this.datePicker.api.open();
  }

  closeCalendar() {
    this.datePicker.api.close();
  }

  log(item) {
    console.log(item);
  }
}
