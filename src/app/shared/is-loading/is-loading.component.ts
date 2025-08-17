import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-is-loading',
    templateUrl: './is-loading.component.html',
    styleUrl: './is-loading.component.scss',
    standalone: false
})
export class IsLoadingComponent {
  @Input() isLoading: boolean = false;

}
