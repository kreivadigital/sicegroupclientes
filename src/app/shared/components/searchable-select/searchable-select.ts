import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  signal,
  computed,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchableSelect),
      multi: true,
    },
  ],
  template: `
    <div class="searchable-select" [class.open]="isOpen()" [class.disabled]="disabled">
      <!-- Input principal -->
      <div class="select-input" (click)="toggle()">
        <span class="selected-text" [class.placeholder]="!selectedOption()">
          {{ selectedOption()?.label || placeholder }}
        </span>
        <i class="bi" [class.bi-chevron-down]="!isOpen()" [class.bi-chevron-up]="isOpen()"></i>
      </div>

      <!-- Dropdown -->
      @if (isOpen()) {
      <div class="select-dropdown">
        <!-- Buscador -->
        <div class="search-wrapper">
          <i class="bi bi-search"></i>
          <input
            #searchInput
            type="text"
            class="search-input"
            [placeholder]="searchPlaceholder"
            [value]="searchTerm()"
            (input)="onSearchInput($event)"
            (click)="$event.stopPropagation()"
          />
          @if (searchTerm()) {
          <button type="button" class="clear-btn" (click)="clearSearch($event)">
            <i class="bi bi-x"></i>
          </button>
          }
        </div>

        <!-- Lista de opciones -->
        <div class="options-list">
          @if (filteredOptions().length === 0) {
          <div class="no-results">No se encontraron resultados</div>
          } @else { @for (option of filteredOptions(); track option.value) {
          <div
            class="option-item"
            [class.selected]="option.value === value()"
            (click)="selectOption(option)"
          >
            {{ option.label }}
          </div>
          } }
        </div>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .searchable-select {
        position: relative;
        width: 100%;
      }

      .select-input {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.375rem 0.75rem;
        font-size: 1rem;
        font-weight: 400;
        line-height: 1.5;
        color: #212529;
        background-color: #fff;
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
        cursor: pointer;
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        min-height: 38px;
      }

      .select-input:hover {
        border-color: #86b7fe;
      }

      .searchable-select.open .select-input {
        border-color: #02661e;
        box-shadow: 0 0 0 0.2rem rgba(2, 102, 30, 0.15);
      }

      .searchable-select.disabled .select-input {
        background-color: #e9ecef;
        cursor: not-allowed;
        opacity: 0.65;
      }

      .selected-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .selected-text.placeholder {
        color: #6c757d;
        background-color: transparent;
        cursor: inherit;
      }

      .select-input i {
        color: #6c757d;
        font-size: 12px;
        margin-left: 8px;
      }

      .select-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 4px;
        background: #fff;
        border: 1px solid #ced4da;
        border-radius: 0.375rem;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        z-index: 1050;
        max-height: 300px;
        display: flex;
        flex-direction: column;
      }

      .search-wrapper {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        border-bottom: 1px solid #e5e7eb;
        gap: 8px;
        background-color: #fff;
      }

      .search-wrapper i {
        color: #9ca3af;
        font-size: 14px;
        flex-shrink: 0;
      }

      .search-input {
        flex: 1;
        border: none;
        outline: none;
        font-size: 14px;
        background-color: #fff;
        color: #212529;
        cursor: text;
        padding: 0;
        margin: 0;
      }

      .search-input::placeholder {
        color: #9ca3af;
      }

      .clear-btn {
        background: none;
        border: none;
        padding: 2px;
        cursor: pointer;
        color: #6c757d;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .clear-btn:hover {
        color: #212529;
      }

      .options-list {
        overflow-y: auto;
        max-height: 240px;
      }

      .option-item {
        padding: 10px 12px;
        cursor: pointer;
        transition: background-color 0.15s ease;
        font-size: 14px;
      }

      .option-item:hover {
        background-color: #f3f4f6;
      }

      .option-item.selected {
        background-color: #02661e1a;
        color: #02661e;
        font-weight: 500;
      }

      .no-results {
        padding: 12px;
        text-align: center;
        color: #6c757d;
        font-size: 14px;
      }
    `,
  ],
})
export class SearchableSelect implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder: string = 'Seleccionar...';
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() disabled: boolean = false;

  @Output() selectionChange = new EventEmitter<SelectOption | null>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  isOpen = signal(false);
  searchTerm = signal('');
  value = signal<string | number | null>(null);

  private onChange: (value: string | number | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef) {}

  filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return this.options;
    }
    return this.options.filter((opt) => opt.label.toLowerCase().includes(term));
  });

  selectedOption = computed(() => {
    const currentValue = this.value();
    if (currentValue === null || currentValue === '') return null;
    return this.options.find((opt) => opt.value == currentValue) || null;
  });

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  toggle() {
    if (this.disabled) return;
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen.set(true);
    this.searchTerm.set('');
    setTimeout(() => {
      this.searchInput?.nativeElement?.focus();
    }, 0);
  }

  close() {
    this.isOpen.set(false);
    this.searchTerm.set('');
    this.onTouched();
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  selectOption(option: SelectOption) {
    this.value.set(option.value);
    this.onChange(option.value);
    this.selectionChange.emit(option);
    this.close();
  }

  clearSearch(event: Event) {
    event.stopPropagation();
    this.searchTerm.set('');
    this.searchInput?.nativeElement?.focus();
  }

  // ControlValueAccessor implementation
  writeValue(value: string | number | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
