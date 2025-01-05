import { Component, inject, OnInit, Renderer2 } from '@angular/core';

import { AuthService } from '../../services/auth.service';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [AsyncPipe, RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  modal: ModalService = inject(ModalService);
  auth: AuthService = inject(AuthService);
  private renderer = inject(Renderer2);

  isDarkMode = false;

  private isLocalStorageAvailable(): boolean {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  ngOnInit() {
    // Check if localStorage is available before using it
    if (this.isLocalStorageAvailable()) {
      this.isDarkMode = localStorage.getItem('theme') === 'dark';
      if (this.isDarkMode) {
        this.renderer.addClass(document.body, 'dark');
      }
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark');
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem('theme', 'dark');
      }
    } else {
      this.renderer.removeClass(document.body, 'dark');
      if (this.isLocalStorageAvailable()) {
        localStorage.setItem('theme', 'light');
      }
    }
  }

  openModal($event: Event) {
    $event.preventDefault();
    this.modal.toggle('auth');
  }
}
