declare interface ConstructorOptions {
	profileDirectory?: string;
	destinationDirectory?: string;
}

declare interface CopyFromUserProfileOptions {
	name: string;
	userProfilePath?: string;
	destinationDirectory?: string;
}

declare interface NoProxySettings {
	proxyType: 'direct';
}

declare interface SystemProxySettings {
	proxyType: 'system';
}

declare interface AutomaticProxySettings {
	proxyType: 'pac';
	autoConfigUrl: string;
}

declare interface ManualProxySettings {
	proxyType: 'manual';
	ftpProxy?: string;
	httpProxy?: string;
	sslProxy?: string;
	socksProxy?: string;
}

declare type ProxySettings = NoProxySettings | SystemProxySettings | AutomaticProxySettings | ManualProxySettings;

declare class ProfileFinder {
	constructor(directory?: string);
	directory: string;
	hasReadProfiles: boolean;
	profiles: string[];
	readProfiles(cb: (err: Error | null, profiles?: string[]) => void): void;
	getPath(name: string, cb: (err: Error | null, path: string | undefined) => void): string | undefined;
}

declare namespace ProfileFinder {
	function locateUserDirectory(platform?: string): string | undefined;
}

declare interface AddonDetails {
	id: string;
	name: string;
	version: string;
	unpack: boolean;
	isNative: boolean;
}

declare class FirefoxProfile {
	constructor(options?: ConstructorOptions | string);
	defaultPreferences: any;
	deleteDir(cb: () => void): void;
	shouldDeleteOnExit(shouldDelete: boolean): void;
	willDeleteOnExit(): boolean;
	setPreference(key: string, value: boolean | string | number): void;
	addExtension(path: string, cb: (err: Error | null, addonDetails?: AddonDetails) => void): void;
	addExtensions(paths: string[], cb: (err?: Error) => void): void;
	updatePreferences(): void;
	path(): string;
	canAcceptUntrustedCerts(): boolean;
	setAcceptUntrustedCerts(acceptUntrusted: boolean): void;
	canAssumeUntrustedCertIssuer(): boolean;
	setAssumeUntrustedCertIssuer(assumeUntrusted: boolean): void;
	nativeEventsEnabled(): boolean;
	setNativeEventsEnabled(enabled: boolean): void;
	encoded(cb: (encodedProfile: string) => void): void;
	encode(cb: (encodedProfile: string) => void): void;
	setProxy(proxySettings: ProxySettings): void;
}

declare namespace FirefoxProfile {
	function copy(options: ConstructorOptions | string | null | undefined, cb: (err: Error | null, profile?: FirefoxProfile) => void): void;
	function copyFromUserProfile(options: CopyFromUserProfileOptions, cb: (err: Error | null, profile?: FirefoxProfile) => void): void;
	var Finder: typeof ProfileFinder;
}

declare module "firefox-profile" {
	export = FirefoxProfile;
}
