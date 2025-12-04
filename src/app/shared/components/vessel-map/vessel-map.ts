import {
  Component,
  Input,
  OnInit,
  signal,
  computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-vessel-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="vessel-map-container">
      @if (!imo) {
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
export class VesselMap implements OnInit {
  @Input() imo?: number;
  @Input() height: string = '300';
  @Input() zoom: string = '3';
  @Input() showTrack: boolean = true;

  iframeSrc = signal<SafeResourceUrl>('');

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    if (this.imo) {
      this.buildIframeSrc();
    }
  }

  private buildIframeSrc() {
    // Construir URL del iframe de VesselFinder
    const params = new URLSearchParams({
      width: '100%',
      height: this.height,
      latitude: '0',
      longitude: '0',
      zoom: this.zoom,
      names: 'false',
      imo: this.imo!.toString(),
      track: this.showTrack ? 'true' : 'false'
    });

    const url = `https://www.vesselfinder.com/aismap?${params.toString()}`;
    this.iframeSrc.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  onIframeLoad() {
    // Iframe cargado correctamente
  }

  onIframeError() {
    console.error('Error loading VesselFinder iframe');
  }
}
