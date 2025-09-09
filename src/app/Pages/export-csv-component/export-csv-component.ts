import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-export-csv',
  template: `<button class="export-btn" (click)="exportToCSV()">Export CSV</button>`,
  standalone: true
})
export class ExportCsvComponent {
  @Input() data: any[] = [];
  @Input() filename: string = 'data.csv';

  exportToCSV() {
    if (!this.data || this.data.length === 0) return;

    const headers = Object.keys(this.data[0]);

    const rows = this.data.map(item =>
      headers.map(header => `"${item[header] !== undefined ? item[header] : ''}"`)
    );

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', this.filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
