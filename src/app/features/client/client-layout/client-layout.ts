import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { Sidebar } from '../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-client-layout',
  imports: [RouterOutlet, Navbar, Sidebar],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.scss',
})
export class ClientLayout {
  sidebarOpen = true;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
}
