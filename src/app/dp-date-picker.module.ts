import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {DpDayPickerComponent} from './dp-day-picker/dp-day-picker.component';
import {DpCalendarComponent} from './dp-calendar/dp-calendar.component';
import { DpTimePickerComponent } from './dp-time-picker/dp-time-picker.component';
export {DpDayPickerComponent} from './dp-day-picker/dp-day-picker.component'

@NgModule({
  declarations: [
    DpDayPickerComponent,
    DpCalendarComponent,
    DpTimePickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [DpDayPickerComponent]
})

export class DpDatePickerModule {
}
