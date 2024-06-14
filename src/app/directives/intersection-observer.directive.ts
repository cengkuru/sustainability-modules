import {Directive, ElementRef, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[appIntersectionObserver]',
  standalone: true
})
export class IntersectionObserverDirective implements OnInit {
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.renderer.addClass(this.el.nativeElement, 'animate-slideUp');
            }
          });
        },
        {
          threshold: 0.1
        }
    );

    observer.observe(this.el.nativeElement);
  }
}
