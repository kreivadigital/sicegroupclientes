import { Component } from '@angular/core';
import { Auth } from '../../../core/services/auth';
import { StatCard } from '../../../shared/components/stat-card/stat-card';

@Component({
  selector: 'app-dashboard',
  imports: [StatCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  constructor(public authService: Auth) {}
}
