import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { JsonFormatterPipe } from "../../../pipes/json-formatter.pipe";
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-json-viewer',
    imports: [CommonModule, FormsModule],
    templateUrl: './json-viewer.component.html',
    styleUrl: './json-viewer.component.scss'
})
export class JsonViewerComponent implements OnChanges, OnInit {
  @Input() json: any;
  formattedJson: string = '';
  isDarkMode: boolean = false;

  ngOnInit() {
    // Check user's preference
    this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  ngOnChanges() {
    if (this.json) {
      const jsonFormatter = new JsonFormatterPipe();
      const formatted = jsonFormatter.transform(this.json);
      this.formattedJson = this.syntaxHighlight(formatted);
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
  }

  private syntaxHighlight(json: string) {
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }
}
