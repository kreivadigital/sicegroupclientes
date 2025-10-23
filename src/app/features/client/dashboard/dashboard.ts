import { Component } from '@angular/core';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  constructor(public authService: Auth) {}
}
