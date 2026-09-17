// GENERATED FILE - edit values here or regenerate from the web console.
import 'package:flutter/material.dart';

class AppConfig {
  static const String appName = 'DeepScreen';
  static const String packageId = 'online.deepscreen.deepscreen';
  static const String startUrl = 'https://deepscreen.online';
  static const String versionName = '1.0.0';
  static const int versionCode = 1;

  // Live sync: the app pulls the latest settings from this endpoint on launch
  // and every time it returns to the foreground.
  static const String liveConfigUrl = 'https://id-preview--d656f4e8-7f6b-423a-b32d-8f87e9471630.lovable.app/api/public/app-config/3409fc51-9891-49b9-bd6f-74fc53c1c418';
  static const bool liveSync = true;


  // Branding
  static const Color themeColor = Color(0xFF0B0E14);
  static const Color accentColor = Color(0xFF22D3A5);
  static const bool lightStatusBarIcons = true;

  // Splash
  static const bool splashEnabled = false;
  static const Color splashBackground = Color(0xFF0B0E14);
  static const Color splashSpinnerColor = Color(0xFFFFC200);
  static const int splashDurationMs = 1600;
  static const bool splashSpinner = true;
  static const String splashTagline = '';

  // Web view settings
  static const String orientation = 'auto';
  static const bool fullscreen = false;
  static const bool pullToRefresh = true;
  static const bool zoomEnabled = false;
  static const bool swipeNavigation = true;
  static const bool javascriptEnabled = true;
  static const bool thirdPartyCookies = false;
  static const bool desktopMode = false;
  static const String userAgentSuffix = 'DeepScreenApp';
  static const String cacheMode = 'default';
  static const String offlineTitle = 'You are offline';
  static const String offlineMessage = 'Check your internet connection and try again.';
  static const bool confirmExit = true;
  static const bool keepScreenOn = false;
  static const bool fileUploads = false;
  static const bool downloads = false;

  // Link handling
  static const List<String> internalDomains = ['deepscreen.online'];
  static const bool openExternalInBrowser = true;
  static const List<String> blockedUrlPatterns = [];
  static const String deepLinkScheme = 'deepscreen';
  static const List<String> universalLinkHosts = ['deepscreen.online'];
  static const bool handleMailto = true;
  static const bool handleTel = true;
  static const bool handleWhatsapp = true;

  // Overrides
  static const String customCss = '';
  static const String customJs = '';
  static const List<String> hideSelectors = [];
  static const String injectTiming = 'documentEnd';
  static const bool disableTextSelection = false;
  static const bool disableContextMenu = false;

  // Add-ons
  static const bool pushEnabled = false;
  static const bool analyticsEnabled = false;
  static const String analyticsId = '';
  static const bool admobEnabled = false;
  static const String admobBannerId = '';
  static const bool biometricLock = false;
  static const bool ratingPrompt = false;
  static const bool shareButton = true;
  static const bool qrScanner = false;
  static const bool bottomNav = false;
  static const List<Map<String, String>> bottomNavItems = [

  ];

  // Localization
  static const String defaultLocale = 'en';
  static const bool followSystemLocale = true;
  static const List<String> supportedLocales = ['en'];

  // Environment values injected at build time
  static const Map<String, String> env = {

  };
}
