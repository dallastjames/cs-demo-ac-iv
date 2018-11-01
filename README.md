# Ionic Customer Success Demo - Identity Vault

This application shows the use of Ionic's Identity Vault within a mobile application. We assume that you have access to Ioinic's Identity Vault product. If this is not the case, please contact our sales department.

## Without Identity Vault - Branch `master`

This is an Ionic application with authentication implemented in a fairly standard manner without anything fancy being used to secure the token. Here are the highlights:

- **AuthenticationService** - handles the http calls for `login` and `logout`
- **IdentityService** - handles the currently logged in user, including managing the token for the user via Ionic Storage
- **HTTP Interceptors** - there are two, one that gets the token and puts it the headers and another that reacts to 401 errors by redirecting to the login page

This scheme works ok for low security applictions. For higher security applications, though, it has a couple of flaws:

1. anyone who gains access to the phone has access to the application
1. anyone who gains access to the phone _could_ gain access to the token

## With Identity Vault - Branch `feature/identityVault`

In order to build this branch, please unpack the Identity Vault package that you were supplied with and place its contents in a folder called `enterprise-auth-master` at the root of this project.

```bash
~/Projects/Demos/cs-demo-iv (feature/identityVault): ls enterprise-auth-master/
DOCUMENTATION.url                 Video-Overview-Presentation.url
Identity Vault Factsheet.pdf      Video-Using-Multiple-Tokens.url
Overview-PDF.pdf                  cordova
Overview-PowerPoint.pptx          demo
README.md                         demo-no-identity-vault
Video-HTTP-Interceptor.url        lib
Video-Implementation-Tutorial.url package.json
```

### Getting Started

```bash
npm install ./enterprise-auth-master/lib
cordova plugin add ./enterprise-auth-master/cordova/ionic-plugin-native-auth
```

### Significant Code Changes

#### Inherit from `IonicIdentityVaultUser`

There is generally a service in any codebase that represents the currently logged in user. In the code in this repo, that service is called the `Identity` service. In other systems it may go by names like `User` or `CurrentUser`. This service will need to be updated to inherit from `IonicIdentityVaultUser`. Any code that is specific to the non-secure storage of the token will also need to be stripped.

##### Configuration

The first task that needs to be done is to configure Identity Vault via the constructor. Note that some of this code already existed in the `Identity` class, but calling `super` with the configuration has been added:

```TypeScript
  constructor(
    private browserAuthPlugin: BrowserAuthPlugin,
    private http: HttpClient,
    public platform: Platform,
    private router: Router
  ) {
    super(platform, {
      enableBiometrics: true,
      lockOnClose: false,
      lockAfter: 5000,
      hideScreenOnBackground: true
    });
    this.changed = new Subject();
  }
```

##### Removing the User

Removing the user now calls the `logout()` in the base class. This clears and locks the vault, effectivly clearing the token (via the `onVaultLocked()` method).

##### Seting the User

The original code set the user and the token as two seperate calls. The new code combines this into a single call. A couple of criteria went into this decision:

1. saving the session in the vault requires the token as well as information from the user
1. there is never a need to set the user without a token
1. the original code handled clearing the token from storage, removing the token from the vault is handled differently

##### Getting the Token

The original code for `getToken()` would grab the token from storage if it had not already done so. The new code it similar and looks like this:

```TypeScript
  async getToken(): Promise<string> {
    if (!this.token) {
      await this.ready();
    }
    return Promise.resolve(this.token);
  }
```

On startup, the base class fetches the token from the vault. Once that is complete, the token is initialized and `ready()` will resolve. From that point forward, the token is set by a user logging in or the session being retored. Likewise, the token is cleared by the user logging out or the vault being locked. Therefore, the existance or not of a token is always accurate unless the application is starting up, in which case the application needs to wait for the base class to be `ready()` before knowing if the token is set or not. Thus, if the token is not set the application ensures that the state is `ready()` before returning.

##### Override Base Functionallity

The `IonicIdentityVaultUser` class contains several methods that can be overridden in the child class. Here are a few of them:

- **onVaultLocked** - handle the vault being locked, generally this involves clearing the token and navigating to the login page
- **onSessionRestored** - takes a token, called when he vault is unlocked and the seesion retored, generally set the token to the one passed to the method
- **getPlugin** - gets the plugin object, useful for testing this method could also return a fully functional service to replace the plugin when the application is run in the web if running in the web is a desired outcome

#### Save the Token in the Vault

The original code contained a method to store the token using Ionic Storage. That was replaced with a method that stores the token in the Identity Vault.

#### Handle Biometric Unlocking of the Token in the Login

This is all new functionallity. The original code did not handle locking the token, and thus had no need for biometric unlocking of the token.

The login page has been modified such that if a locked token exists and biometric unlocking is enabled, a button is displayed that allows for biometric unlocking of the token.