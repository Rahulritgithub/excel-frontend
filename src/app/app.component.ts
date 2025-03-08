import { Component } from '@angular/core';
import { LogParserComponent } from './log-parser/log-parser.component';
import { LogService } from './log.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LogParserComponent],
  template: `<app-log-parser></app-log-parser>`,
  providers: [LogService] // Ensure LogService is provided
})
export class AppComponent { }
