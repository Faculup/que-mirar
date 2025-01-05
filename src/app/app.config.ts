import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(BrowserAnimationsModule),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'scheduler-app-a1fa3',
        appId: '1:810517199160:web:9485292e310f983dc329cd',
        storageBucket: 'scheduler-app-a1fa3.firebasestorage.app',
        apiKey: 'AIzaSyCe7JA6YQxdCg1fHatENQUWI7JPrrYlBX8',
        authDomain: 'scheduler-app-a1fa3.firebaseapp.com',
        messagingSenderId: '810517199160',
        measurementId: 'G-ZKJSWGF14R',
      })
    ),
    provideFirestore(() => getFirestore()),
    provideAnimationsAsync(),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
  ],
};
