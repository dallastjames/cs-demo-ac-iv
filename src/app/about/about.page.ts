import { Component } from '@angular/core';
import { AuthMode } from '@ionic-enterprise/identity-vault';

import { AuthenticationService } from '../services/authentication';
import { IdentityService } from '../services/identity';
import { User } from '../models/user';

@Component({
  selector: 'app-about',
  templateUrl: 'about.page.html',
  styleUrls: ['about.page.scss']
})
export class AboutPage {
  user: User;
  authMode: string;
  bioType: string;

  constructor(
    private authentication: AuthenticationService,
    private identity: IdentityService,
  ) {}

  getUserInfo() {
    if (this.user === undefined) {
      return 'user is undefined.';
    } else {
      return `Email: ${this.user.email} UserID: ${this.user.id}`;
    }
  }

  async ionViewDidEnter() {
    this.identity.get().subscribe(u => (this.user = u));
    this.authMode = AuthMode[await this.identity.getAuthMode()];
    this.bioType = await this.identity.getBiometricType();
  }

  logout() {
    this.authentication.logout();
  }
}
