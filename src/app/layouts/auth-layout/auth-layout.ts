import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Layout para páginas de autenticación
 * No incluye sidebar ni navegación
 * Usado para login, registro, recuperar contraseña, etc.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {}
