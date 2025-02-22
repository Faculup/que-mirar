import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home-page/home-page.component'),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products-page/products-page.component'),
  },
  {
    path: 'locations',
    loadComponent: () =>
      import('./pages/locations-page/locations-page.component'),
  },
];
