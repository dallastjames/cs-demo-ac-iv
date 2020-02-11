export function createBrowserAuthServiceMock() {
  return jasmine.createSpyObj('BrowserAuthService', {
    clear: Promise.resolve(),
    getBiometricType: Promise.resolve(),
    getConfig: Promise.resolve({}),
    getToken: Promise.resolve(),
    getUsername: Promise.resolve(''),
    getValue: Promise.resolve(),
    isBiometricsEnabled: Promise.resolve(false),
    isBiometricsAvailable: Promise.resolve(false),
    isInUse: Promise.resolve(false),
    isLocked: Promise.resolve(false),
    isPasscodeEnabled: Promise.resolve(false),
    isPasscodeSetupNeeded: Promise.resolve(false),
    isSecureStorageModeEnabled: Promise.resolve(true),
    lock: Promise.resolve(),
    remainingAttempts: Promise.resolve(1),
    setBiometricsEnabled: Promise.resolve(),
    setPasscode: Promise.resolve(),
    setPasscodeEnabled: Promise.resolve(),
    setSecureStorageModeEnabled: Promise.resolve(),
    storeToken: Promise.resolve(),
    storeValue: Promise.resolve(),
    unlock: Promise.resolve(),
    unsubscribe: Promise.resolve(),
  });
}