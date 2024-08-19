import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatSectionTitle',
    standalone: true  // Add this line
})
export class FormatSectionTitlePipe implements PipeTransform {
    transform(value: string): string {
        // Split the string at capital letters and numbers
        const words = value.split(/(?=[A-Z0-9])/).map(word => word.charAt(0).toUpperCase() + word.slice(1));

        // Join the words with spaces
        return words.join(' ');
    }
}
