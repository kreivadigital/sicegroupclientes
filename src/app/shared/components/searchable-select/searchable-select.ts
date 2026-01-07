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
  templateUrl: './searchable-select.html',
  styleUrls: ['./searchable-select.scss']
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
