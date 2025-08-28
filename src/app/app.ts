// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-root',
//   template:'./app.html',
//   styleUrls: ['./app.css']
// })
// export class AppComponent {
//   title = 'chat';
// }

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';


@Component({
selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    HttpClientModule,
    
  ],
  templateUrl: './app.html',
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AppComponent {
  protected readonly title = signal('workshop6');
}
