import { Component } from '@angular/core';

import {
  AuthenticationService,
  VaultService,
  AnalyticsService,
} from '@app/services';
import { AuthMode, VaultErrorCodes } from '@ionic-enterprise/identity-vault';
import { Plugins } from '@capacitor/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  errorMessage: string;

  loginType: string;
  instanceId: string;

  constructor(
    private authentication: AuthenticationService,
    private vaultService: VaultService,
    private analytics: AnalyticsService,
  ) {}

  ionViewWillEnter() {
    try {
      this.setUnlockType();
    } catch (e) {
      console.error('Unable to check token status', e);
    }
    this.analytics.trackScreen('loginPage');
    this.analytics.getFirebaseId().then(id => (this.instanceId = id));
  }

  async unlockClicked() {
    const hasSession = await this.vaultService.hasStoredSession();

    if (hasSession) {
      await this.tryUnlock();
    }
  }

  async signInClicked() {
    this.analytics.logEvent('login_attempt');
    try {
      await this.authentication.login();
      this.errorMessage = '';
      this.analytics.logEvent('login_success');
    } catch (e) {
      this.errorMessage = e.message || 'Unknown login error';
      console.error(e);
      this.analytics.logEvent('login_failure');
    }
  }

  private async tryUnlock() {
    try {
      await this.vaultService.unlock();
      this.analytics.logEvent('vault_unlock_success');
    } catch (error) {
      if (this.notFailedOrCancelled(error)) {
        throw error;
      }
      if (error.code === VaultErrorCodes.AuthFailed) {
        alert('Unable to unlock the token');
        this.setUnlockType();
      }
      this.analytics.logEvent('vault_unlock_failure');
    }
  }

  private async setUnlockType(): Promise<void> {
    const previousLoginType = this.loginType;
    await this.determineLoginType();
    if (previousLoginType && !this.loginType) {
      alert('The vault is no longer accessible. Please login again');
    }
  }

  private async determineLoginType() {
    if (await this.vaultService.hasStoredSession()) {
      const authMode = await this.vaultService.getAuthMode();
      switch (authMode) {
        case AuthMode.BiometricAndPasscode:
          this.loginType = await this.vaultService.supportedBiometricTypes();
          this.loginType += ' (Passcode Fallback)';
          break;
        case AuthMode.BiometricOnly:
          const displayVaultLogin = await this.vaultService.isBiometricsAvailable();
          this.loginType = displayVaultLogin
            ? await this.vaultService.supportedBiometricTypes()
            : '';
          break;
        case AuthMode.PasscodeOnly:
          this.loginType = 'Passcode';
          break;
        case AuthMode.SecureStorage:
          this.loginType = 'Secure Storage';
          break;
      }
    } else {
      this.loginType = '';
    }
  }

  private notFailedOrCancelled(error: any) {
    return (
      error.code !== VaultErrorCodes.AuthFailed &&
      error.code !== VaultErrorCodes.UserCanceledInteraction
    );
  }
}
