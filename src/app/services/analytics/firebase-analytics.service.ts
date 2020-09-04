import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';
import { FirebaseAnalyticsPlugin } from '@capacitor-community/firebase-analytics';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private _firebaseAnalytics: FirebaseAnalyticsPlugin;
  private get firebaseAnalytics(): FirebaseAnalyticsPlugin {
    if (!this._firebaseAnalytics) {
      throw new Error(
        'You must call AnalyticsService.init() before any other methods',
      );
    }
    return this._firebaseAnalytics;
  }

  constructor() {}

  public init(): void {
    const { FirebaseAnalytics } = Plugins;
    this._firebaseAnalytics = FirebaseAnalytics;
    FirebaseAnalytics.setCollectionEnabled({
      enabled: true,
    });
  }

  public async getFirebaseId(): Promise<string> {
    const instance = await this.firebaseAnalytics.getAppInstanceId();
    return instance.instanceId;
  }

  public setUserId(userId: string): void {
    this.firebaseAnalytics.setUserId({
      userId,
    });
  }

  public setUserProperty(prop: { name: string; value: string }): void {
    this.firebaseAnalytics.setUserProperty(prop);
  }

  public trackScreen(screenName: string): void {
    this.firebaseAnalytics.setScreenName({
      screenName,
      nameOverride: `${screenName}-test`,
    });
  }

  public logEvent(eventName: string): void {
    this.firebaseAnalytics.logEvent({
      name: eventName,
      params: {},
    });
  }
}
