import { HttpErrorResponse } from '@angular/common/http';

export function setErrorMessage(
  error: HttpErrorResponse | null,
  entityName: string
): string {
  if (!error) return '';

  switch (error.status) {
    case 404:
      return `${entityName} not found`;
    case 500:
      return `Server error while fetching ${entityName.toLowerCase()}`;
    default:
      return `Error loading ${entityName.toLowerCase()}: ${error.message}`;
  }
}
