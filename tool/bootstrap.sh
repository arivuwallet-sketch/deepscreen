#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
test -f pubspec.yaml || { echo "pubspec.yaml was not found; run this script from the exported project." >&2; exit 1; }

requested="${1:-both}"
case "$requested" in
  android) flutter_platforms="android" ;;
  ios) flutter_platforms="ios" ;;
  both) flutter_platforms="android,ios" ;;
  *) echo "Usage: bash tool/bootstrap.sh [android|ios|both]" >&2; exit 2 ;;
esac

backup_dir="$(mktemp -d)"
trap 'rm -rf "$backup_dir"' EXIT
if [ -f android/app/src/main/AndroidManifest.xml ]; then
  cp android/app/src/main/AndroidManifest.xml "$backup_dir/AndroidManifest.xml"
fi
if [ -f ios/Runner/Info.plist ]; then
  cp ios/Runner/Info.plist "$backup_dir/Info.plist"
fi

if [[ "$requested" == "android" || "$requested" == "both" ]]; then rm -rf android; fi
if [[ "$requested" == "ios" || "$requested" == "both" ]]; then rm -rf ios; fi

flutter create --platforms="$flutter_platforms" --project-name="deepscreen" --org="online.deepscreen" .

if [[ "$requested" == "android" || "$requested" == "both" ]]; then
  if [ -f "$backup_dir/AndroidManifest.xml" ]; then
    cp "$backup_dir/AndroidManifest.xml" android/app/src/main/AndroidManifest.xml
  fi
  gradle_file="android/app/build.gradle.kts"
  if [ -f "$gradle_file" ]; then
    sed -i.bak 's/minSdk = flutter.minSdkVersion/minSdk = 23/' "$gradle_file" && rm -f "$gradle_file.bak"
  fi
fi

if [[ "$requested" == "ios" || "$requested" == "both" ]]; then
  if [ -f "$backup_dir/Info.plist" ]; then cp "$backup_dir/Info.plist" ios/Runner/Info.plist; fi
  sed -i.bak 's/IPHONEOS_DEPLOYMENT_TARGET = [0-9.]*/IPHONEOS_DEPLOYMENT_TARGET = 13.0/g' ios/Runner.xcodeproj/project.pbxproj
  rm -f ios/Runner.xcodeproj/project.pbxproj.bak
fi

echo "Modern Flutter platform files are ready for $requested."
