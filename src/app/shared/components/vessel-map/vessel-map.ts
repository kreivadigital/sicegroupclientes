import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-vessel-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vessel-map-container">
      @if (!vesselImo) {
        <div class="map-no-data">
          <i class="bi bi-geo-alt"></i>
          <span>Sin datos de tracking disponibles</span>
        </div>
      } @else {
        <iframe
          [src]="iframeSrc()"
          [style.height.px]="height"
          width="100%"
          frameborder="0"
          scrolling="no"
          (load)="onIframeLoad()"
          (error)="onIframeError()">
        </iframe>
      }
    </div>
  `,
  styles: [`
    .vessel-map-container {
      width: 100%;
      position: relative;
      background: #f8f9fa;
      border-radius: 0 0 8px 8px;
      overflow: hidden;
    }

    iframe {
      display: block;
      width: 100%;
      border: none;
    }

    .map-no-data {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem;
      color: #6c757d;
      min-height: 300px;
    }

    .map-no-data i {
      font-size: 1.5rem;
    }
  `]
})
export class VesselMap implements OnInit, OnChanges {
  @Input() vesselImo?: string;
  @Input() height: string = '300';
  @Input() zoom: number = 6;
  @Input() showTrack: boolean = true;

  iframeSrc = signal<SafeResourceUrl>('');

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.buildIframeSrc();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['vesselImo'] && !changes['vesselImo'].firstChange) {
      this.buildIframeSrc();
    }
  }

  private buildIframeSrc() {
    if (!this.vesselImo) {
      return;
    }

    // URL directa del embed de VesselFinder
    const params = new URLSearchParams({
      imo: this.vesselImo,
      zoom: this.zoom.toString(),
      width: '100%',
      height: '100%',
      names: 'true',
      track: this.showTrack ? 'true' : 'false',
    });

    const url = `https://www.vesselfinder.com/aismap?${params.toString()}`;

    console.log('[VesselMap] Vessel IMO:', this.vesselImo);
    console.log('[VesselMap] URL:', url);

    this.iframeSrc.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  onIframeLoad() {
    console.log('[VesselMap] Iframe loaded');
  }

  onIframeError() {
    console.error('[VesselMap] Error loading iframe');
  }
}
