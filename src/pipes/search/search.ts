import { Pipe, PipeTransform } from '@angular/core';

/**
 * Generated class for the SearchPipe pipe.
 *
 * See https://angular.io/api/core/Pipe for more info on Angular Pipes.
 */
@Pipe({
  name: 'search',
})
export class SearchPipe implements PipeTransform {

  transform(items: any[], terms: string): any[] {
    let array;
    if (!items) return [];
    if (!terms) return items;
    terms = terms.toLowerCase();
    array = items.filter(it => {
      //return it.title.toLowerCase().includes(terms) && it.datum.toLowerCase().includes(terms);
      return it.datum.includes(terms);
    });
    array = array.concat(items.filter(it => {
      return it.vorname.toLowerCase().includes(terms);
    }));
    array = array.concat(items.filter(it => {
      return it.nachname.toLowerCase().includes(terms);
    }));
    array = array.concat(items.filter(it => {
      return it.title.toLowerCase().includes(terms);
    }));

    return array;
  }
}
