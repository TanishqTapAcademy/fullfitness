#!/bin/bash

osascript <<EOF
tell application "Terminal"
    activate

    -- Tab 1: Backend API
    do script "cd /Users/tanishqbhosale/Desktop/projects/fullFitness/backend && npm run dev" in front window
    delay 1

    -- Tab 2: Admin Panel
    tell application "System Events" to keystroke "t" using command down
    delay 0.5
    do script "cd /Users/tanishqbhosale/Desktop/projects/fullFitness/firnessAdmin && npm run dev" in front window
    delay 1

    -- Tab 3: Mobile App
    tell application "System Events" to keystroke "t" using command down
    delay 0.5
    do script "cd /Users/tanishqbhosale/Desktop/projects/fullFitness/fity && npx expo start" in front window
end tell
EOF
