import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../../core/services/setting.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  Setting,
  SettingsGrouped,
  SETTING_GROUPS,
  SETTING_GROUP_LABELS,
  SETTING_GROUP_ICONS,
  SettingType,
} from '../../../core/models/setting.model';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings implements OnInit {
  private settingService = inject(SettingService);
  private toastService = inject(ToastService);

  // State
  settings = signal<SettingsGrouped>({});
  availableGroups = signal<string[]>([]);
  loading = signal<boolean>(false);
  clearingCache = signal<boolean>(false);

  // Edit state
  editingId = signal<number | null>(null);
  editValue = signal<string>('');
  saving = signal<boolean>(false);

  // Constants for template
  readonly groupLabels = SETTING_GROUP_LABELS;
  readonly groupIcons = SETTING_GROUP_ICONS;
  readonly settingGroups = SETTING_GROUPS;

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading.set(true);
    this.settingService.getSettings().subscribe({
      next: (response) => {
        this.settings.set(response.data);
        this.availableGroups.set(response.available_groups);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error cargando configuraciones:', error);
        this.toastService.error('Error al cargar las configuraciones');
        this.loading.set(false);
      }
    });
  }

  getSettingsForGroup(group: string): Setting[] {
    return this.settings()[group] || [];
  }

  startEdit(setting: Setting) {
    this.editingId.set(setting.id);

    // Si NO está encriptado, mostrar el valor actual para edición
    // Si está encriptado, dejar vacío (el usuario debe ingresar el valor completo)
    if (!setting.is_encrypted && setting.masked_value) {
      this.editValue.set(setting.masked_value);
    } else {
      this.editValue.set('');
    }
  }

  cancelEdit() {
    this.editingId.set(null);
    this.editValue.set('');
  }

  saveSetting(setting: Setting) {
    if (this.saving()) return;

    this.saving.set(true);
    this.settingService.updateSetting(setting.id, {
      value: this.editValue(),
      is_encrypted: setting.is_encrypted,
      type: setting.type,
    }).subscribe({
      next: (response) => {
        this.toastService.success('Configuracion actualizada correctamente');
        this.editingId.set(null);
        this.editValue.set('');
        this.saving.set(false);
        this.loadSettings(); // Reload to get new masked value
      },
      error: (error) => {
        console.error('Error actualizando configuracion:', error);
        this.toastService.error('Error al actualizar la configuracion');
        this.saving.set(false);
      }
    });
  }

  clearCache() {
    if (this.clearingCache()) return;

    this.clearingCache.set(true);
    this.settingService.clearCache().subscribe({
      next: (response) => {
        this.toastService.success('Cache limpiado correctamente');
        this.clearingCache.set(false);
      },
      error: (error) => {
        console.error('Error limpiando cache:', error);
        this.toastService.error('Error al limpiar el cache');
        this.clearingCache.set(false);
      }
    });
  }

  getGroupIcon(group: string): string {
    return this.groupIcons[group as keyof typeof this.groupIcons] || 'bi-gear';
  }

  getGroupLabel(group: string): string {
    return this.groupLabels[group as keyof typeof this.groupLabels] || group;
  }

  getTypeIcon(type: SettingType): string {
    switch (type) {
      case 'string': return 'bi-fonts';
      case 'integer': return 'bi-123';
      case 'boolean': return 'bi-toggle-on';
      case 'json': return 'bi-braces';
      default: return 'bi-question-circle';
    }
  }
}
