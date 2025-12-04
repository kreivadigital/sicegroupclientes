import { Routes } from '@angular/router';
import { Login } from './login/login';
import { PasswordReset } from './password-reset/password-reset';
import { ChangePassword } from './change-password/change-password';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login,
    title: 'Iniciar Sesión - Sice Group'
  },
  {
    path: 'password-reset',
    component: PasswordReset,
    title: 'Restablecer Contraseña - Sice Group'
  },
  {
    path: 'change-password',
    component: ChangePassword,
    title: 'Cambiar Contraseña - Sice Group'
  }
];
