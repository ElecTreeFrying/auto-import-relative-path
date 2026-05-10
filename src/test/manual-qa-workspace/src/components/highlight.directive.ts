import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {
  @Input() appHighlight = 'yellow';

  constructor(private readonly element: ElementRef<HTMLElement>) {}

  @HostListener('mouseenter')
  onEnter(): void {
    this.element.nativeElement.style.backgroundColor = this.appHighlight;
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.element.nativeElement.style.backgroundColor = '';
  }
}
