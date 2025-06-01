import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ScreenService {
  private readonly MOBILE_BREAKPOINT = '(max-width: 768px)';

  // Observable that returns true when screen is mobile size
  isMobile$: Observable<boolean>;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isMobile$ = this.breakpointObserver
      .observe(this.MOBILE_BREAKPOINT)
      .pipe(
        map((result) => result.matches),
        shareReplay(1) // Cache the latest value
      );

    // Log screen size changes
    this.isMobile$.subscribe((isMobile) => {
      console.log(`Screen is now ${isMobile ? 'mobile' : 'desktop'} size`);
    });
  }
}
