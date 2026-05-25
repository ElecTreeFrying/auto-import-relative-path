import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar';

@Component({
  selector: 'app-root',
  imports: [ RouterOutlet ],
  template: `
    <main>
      <router-outlet />
    </main>
  `,
})
export class App {}
