import { Component, Output, EventEmitter } from '@angular/core';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(public authService: Auth) {}

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  onLogout() {
    this.authService.logout();
  }
}
