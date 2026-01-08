import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Tutorial {
  id: number;
  title: string;
  description: string;
  driveUrl: string;
}

@Component({
  selector: 'app-tutorials',
  imports: [FormsModule],
  templateUrl: './tutorials.html',
  styleUrl: './tutorials.scss',
})
export class Tutorials {
  searchTerm = signal('');

  tutorials: Tutorial[] = [
    {
      id: 1,
      title: 'Crear nuevo contenedor',
      description: 'Aprende a crear un nuevo contenedor en el sistema',
      driveUrl: 'https://drive.google.com/open?id=1ARNkR02DVR8o4fIZt9qHRKCjkXhqC6L_&usp=drive_copy',
    },
    {
      id: 2,
      title: 'Agregar nota al contenedor',
      description: 'Cómo agregar notas y observaciones a un contenedor existente',
      driveUrl: 'https://drive.google.com/open?id=1aCxUsdEy9DVNARj8JAOdaTIybfX3NTw5&usp=drive_copy',
    },
    {
      id: 3,
      title: 'Agregar nuevo cliente',
      description: 'Proceso para registrar un nuevo cliente en el sistema',
      driveUrl: 'https://drive.google.com/open?id=1Il9t7aH3rHJz9fzE8bP_UMNQrX4c0wf-&usp=drive_copy',
    },
    {
      id: 4,
      title: 'Cambiar contraseña del cliente',
      description: 'Cómo restablecer o cambiar la contraseña de un cliente',
      driveUrl: 'https://drive.google.com/open?id=1plzOaPW6H3nCds-bvDGOI2linghRQB8S&usp=drive_copy',
    },
    {
      id: 5,
      title: 'Crear orden del cliente',
      description: 'Pasos para crear una nueva orden asociada a un cliente',
      driveUrl: 'https://drive.google.com/open?id=157EL2_4QfZYf_-hWUF-52a2mabb4BA4J&usp=drive_copy',
    },
    {
      id: 6,
      title: 'Editar orden del cliente',
      description: 'Cómo modificar los datos de una orden existente',
      driveUrl: 'https://drive.google.com/open?id=1BYNTn8KWtsdCQFY_B0wdDmCkZ_1vC1dy&usp=drive_copy',
    },
    {
      id: 7,
      title: 'Agregar notificación en una orden del cliente',
      description: 'Proceso para agregar notificaciones a las órdenes',
      driveUrl: 'https://drive.google.com/open?id=1KJUzODWXD2UgEUW35iZV4o8Iiv49YMDH&usp=drive_copy',
    },
  ];

  filteredTutorials = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const sorted = [...this.tutorials].sort((a, b) => a.title.localeCompare(b.title));
    if (!term) {
      return sorted;
    }
    return sorted.filter(tutorial =>
      tutorial.title.toLowerCase().includes(term)
    );
  });

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  openTutorial(url: string): void {
    window.open(url, '_blank');
  }
}
