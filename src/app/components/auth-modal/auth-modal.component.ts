import { Component } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { TabsContainerComponent } from '../tabs-container/tabs-container.component';
import { TabComponent } from '../tab/tab.component';
import { LoginComponent } from '../login/login.component';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [
    ModalComponent,
    TabsContainerComponent,
    TabComponent,
    LoginComponent,
    RegisterComponent,
  ],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css',
})
export class AuthModalComponent {}
