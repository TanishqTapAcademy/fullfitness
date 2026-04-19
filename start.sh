#!/bin/bash

# Try connecting to phone (USB or WiFi) and set up port forwarding
export ANDROID_HOME="$HOME/Library/Android/sdk"
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
if adb devices 2>/dev/null | grep -q "device$"; then
  echo "Phone connected via USB"
  adb reverse tcp:8081 tcp:8081 2>/dev/null
  adb reverse tcp:3001 tcp:3001 2>/dev/null
elif adb connect 192.168.0.101:5555 2>/dev/null | grep -q "connected"; then
  echo "Phone connected via WiFi"
  adb reverse tcp:8081 tcp:8081 2>/dev/null
  adb reverse tcp:3001 tcp:3001 2>/dev/null
else
  echo "No phone connected — skip ADB setup"
fi

osascript <<EOF
tell application "Terminal"
    activate

    -- Tab 1: Backend API
    do script "cd /Users/tanishqbhosale/Desktop/projects/fullFitness/backend && source venv/bin/activate && python main.py" in front window
    delay 1

    -- Tab 2: Admin Panel
    tell application "System Events" to keystroke "t" using command down
    delay 0.5
    do script "cd /Users/tanishqbhosale/Desktop/projects/fullFitness/firnessAdmin && npm run dev" in front window
    delay 1

    -- Tab 3: Mobile App
    tell application "System Events" to keystroke "t" using command down
    delay 0.5
    do script "cd /Users/tanishqbhosale/Desktop/projects/fullFitness/fity && npx expo start --dev-client -c" in front window
end tell
EOF
