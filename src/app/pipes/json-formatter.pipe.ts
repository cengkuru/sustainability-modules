import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'jsonFormatter',
    standalone: true
})
export class JsonFormatterPipe implements PipeTransform {
    transform(value: any): string {
        return JSON.stringify(value, null, 2);
    }
}
