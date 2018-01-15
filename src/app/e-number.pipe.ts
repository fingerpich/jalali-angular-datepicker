import { Pipe, PipeTransform } from '@angular/core';
import { Persian } from './persian';

@Pipe({
  name: 'eNumber'
})
export class ENumberPipe implements PipeTransform {

  transform(str: any, args?: any): any {
    if ((str != null) && str.toString().trim() !== '') {
      return Persian.persianToEnglishNumber(str.toString()).toString();
    } else {
      return '';
    }
  }

}
