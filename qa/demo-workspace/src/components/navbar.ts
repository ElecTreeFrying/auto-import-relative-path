import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-navbar',
  template: `
    <nav>
      <a routerLink="/">Home</a>
      <a routerLink="/dashboard">Dashboard</a>
    </nav>
  `,
})
export class Navbar {
  isOpen = signal(false);
}
