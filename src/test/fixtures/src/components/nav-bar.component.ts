import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  template: `<nav class="nav-bar">{{ title }}</nav>`,
})
export class NavBarComponent {
  @Input() title = 'Home';
}
