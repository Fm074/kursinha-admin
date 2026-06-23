import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-header-admin',
    imports: [],
    templateUrl: './header-admin.component.html',
    styleUrl: './header-admin.component.scss'
})
export class HeaderAdminComponent {
  @Input() title: string = '';
  @Input() description: string = '';
} 