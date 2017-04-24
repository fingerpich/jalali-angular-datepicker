import {Component, ViewChild, HostListener} from '@angular/core';
import {DatePickerComponent} from '../../date-picker/date-picker.component';
import {Moment} from 'jalali-moment';
import {IDatePickerConfig} from '../../date-picker/date-picker-config.model';
import debounce from '../../common/decorators/decorators';
import {DayCalendarComponent} from '../../day-calendar/day-calendar.component';

@Component({
  selector: 'dp-demo',
  templateUrl: './demo.component.html',
  entryComponents: [DatePickerComponent],
  styleUrls: ['./demo.component.less']
})
export class DemoComponent {
  @ViewChild('datePicker') datePicker: DatePickerComponent;
  demoFormat = 'DD-MM-YYYY';
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

  config: IDatePickerConfig = {
    firstDayOfWeek: 'sa',
    format: 'jDD-jMM-jYYYY',
    monthFormat: 'jMMMM, jYYYY',
    disableKeypress: false,
    allowMultiSelect: false,
    closeOnSelect: undefined,
    closeOnSelectDelay: 100,
    onOpenDelay: 0,
    weekdayNames: {
      su: 'ی',
      mo: 'د',
      tu: 'س',
      we: 'چ',
      th: 'پ',
      fr: 'ج',
      sa: 'ش'
    },
    appendTo: document.body,
    drops: 'down',
    opens: 'right',
    showNearMonthDays: true,
    showWeekNumbers: false,
    enableMonthSelector: true,
    yearFormat: 'jYYYY',
    showGoToCurrent: true,
    dayBtnFormat: 'jDD',
    monthBtnFormat: 'jMMMM'
  };
  isAtTop: boolean = true;

  @HostListener('document:scroll')
  @debounce(100)
  updateIsAtTop() {
    this.isAtTop = document.body.scrollTop === 0;
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
