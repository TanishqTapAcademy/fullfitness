# Adapty Subscription System — Complete Android Dev Plan

## Context

Fity has no payment/subscription system. The user wants to monetize via message-gated subscriptions using Adapty. Free users get 5 coach messages/day; premium users get unlimited. The user is developing for Android with EAS Build. No products exist in Google Play Console yet, and no paywall has been created in the Adapty dashboard.

This plan covers: SDK integration, dev-mode testing, message gating (client + server), paywall screen, backid the end webhook, database changes, and the full Google Play setup workflow.

**Adapty SDK Key:** `public_live_KBo5Rbfe.Pvjh379sTW2o2WJZkZjL`

---

## Phase 1: Install Adapty SDK + Configure Expo Build

### Step 1.1: Install packages
```bash
cd fity
npx expo install react-native-adapty
```

### Step 1.2: Update `app.json` plugins
Add Adapty plugin + fix potential Android backup conflict with expo-secure-store:
```json
"plugins": [
  ["react-native-adapty", { "replaceAndroidBackupConfig": true }],
  ["expo-secure-store", { "configureAndroidBackup": false }],
  ... existing plugins
]
```

### Step 1.3: Create `eas.json` (doesn't exist yet)
```json
{
  "cli": { "version": ">= 16.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  }
}
```

### Step 1.4: Prebuild
```bash
npx expo prebuild --clean
```

**Files to create/modify:**
- `fity/eas.json` (new)
- `fity/app.json` (modify plugins array)
- `fity/.env` (add `EXPO_PUBLIC_ADAPTY_SDK_KEY`)

---

## Phase 2: Initialize Adapty SDK in App

### Step 2.1: Create Adapty service — `fity/src/services/adapty.ts`

Following the same pattern as `onesignal.ts` and `posthog.ts`:

```typescript
import { adapty } from 'react-native-adapty';

const ADAPTY_KEY = process.env.EXPO_PUBLIC_ADAPTY_SDK_KEY
  || 'public_live_KBo5Rbfe.Pvjh379sTW2o2WJZkZjL';

export function initAdapty() {
  adapty.activate(ADAPTY_KEY, {
    logLevel: __DEV__ ? 'verbose' : 'error',
    __ignoreActivationOnFastRefresh: __DEV__,
  });
}

export async function identifyAdaptyUser(userId: string) {
  try {
    await adapty.identify(userId);
  } catch (e) {
    console.warn('[Adapty] identify failed:', e);
  }
}

export async function logoutAdapty() {
  try {
    await adapty.logout();
  } catch (e) {
    console.warn('[Adapty] logout failed:', e);
  }
}

export async function checkPremium(): Promise<boolean> {
  // DEV TOGGLE: flip to true to simulate premium in dev
  if (__DEV__ && typeof DEV_FORCE_PREMIUM !== 'undefined') {
    return DEV_FORCE_PREMIUM;
  }
  try {
    const profile = await adapty.getProfile();
    return profile.accessLevels?.premium?.isActive === true;
  } catch {
    return false;
  }
}

// Toggle this in dev to test both states
const DEV_FORCE_PREMIUM: boolean | undefined = __DEV__ ? false : undefined;
```

### Step 2.2: Init in `app/_layout.tsx`

Add alongside existing OneSignal + PostHog init:

```typescript
import { initAdapty, identifyAdaptyUser } from '../src/services/adapty';

// In the useEffect, after initOneSignal() and initPostHog():
initAdapty();

// After auth is initialized and user is identified:
if (session?.user?.id) {
  identifyAdaptyUser(session.user.id);
}
```

### Step 2.3: Sync on auth state changes in `authStore.ts`

- On `signIn*()` success: call `identifyAdaptyUser(session.user.id)`
- On `signOut()`: call `logoutAdapty()`

**Files to create/modify:**
- `fity/src/services/adapty.ts` (new)
- `fity/app/_layout.tsx` (modify — add initAdapty + identifyAdaptyUser calls)
- `fity/src/store/authStore.ts` (modify — add Adapty sync on login/logout)

---

## Phase 3: Subscription Store (Client-Side State)

### Step 3.1: Create `fity/src/store/subscriptionStore.ts`

New Zustand store following existing patterns:

```typescript
interface SubscriptionState {
  isPremium: boolean;
  dailyMessageCount: number;
  dailyMessageLimit: number;
  lastCountDate: string; // "YYYY-MM-DD"
  loading: boolean;

  // Actions
  checkSubscription: () => Promise<void>;
  incrementMessageCount: () => void;
  canSendMessage: () => boolean;
  resetDailyCount: () => void;
}
```

**Key logic:**
- `dailyMessageLimit = 5` for free users
- `canSendMessage()`: returns `true` if premium OR `dailyMessageCount < dailyMessageLimit`
- `incrementMessageCount()`: bumps count, auto-resets if date changed
- `checkSubscription()`: calls `adapty.getProfile()`, updates `isPremium`
- Dev toggle support: `DEV_FORCE_PREMIUM` bypasses Adapty call

**Files to create:**
- `fity/src/store/subscriptionStore.ts` (new)

---

## Phase 4: Paywall Screen

### Step 4.1: Create custom paywall — `fity/app/(app)/paywall.tsx`

A modal screen (like baseline.tsx pattern) matching dark theme + lime accent:

**Design:**
- Modal presentation (slide_from_bottom)
- Dark background (#0D0D0D)
- Header: "Unlock Unlimited Coaching"
- Feature list with lime checkmarks:
  - Unlimited daily messages
  - Image analysis (food/form check)
  - Advanced metrics & trends
  - Personalized nudges
- Two plan cards:
  - Annual: $59.99/yr — "BEST VALUE" badge (lime), "$4.99/mo"
  - Monthly: $9.99/mo
- CTA button (lime #E8FF6B): "Start 7-Day Free Trial"
- Footer: "Restore purchases" link, "Cancel anytime" text
- Close (X) button top-right

**Two modes:**
1. **Adapty mode** (production): Fetches paywall via `adapty.getPaywall()`, uses Adapty's native purchase flow
2. **Dev mode**: Shows the UI, taps toggle `DEV_FORCE_PREMIUM` and navigates back

### Step 4.2: Add to router — `fity/app/(app)/_layout.tsx`

Add paywall as a modal route (same pattern as baseline):
```typescript
<Stack.Screen name="paywall" options={{
  presentation: 'modal',
  animation: 'slide_from_bottom'
}} />
```

### Step 4.3: Create limit-reached bottom sheet — `fity/src/components/chat/MessageLimitSheet.tsx`

Shown inline in chat when limit is hit:
- "You've used 5/5 free messages today"
- "Upgrade for unlimited coaching"
- [Upgrade] button → navigates to paywall
- [Maybe later] dismisses

**Files to create/modify:**
- `fity/app/(app)/paywall.tsx` (new)
- `fity/app/(app)/_layout.tsx` (modify — add paywall route)
- `fity/src/components/chat/MessageLimitSheet.tsx` (new)

---

## Phase 5: Message Gating in Chat (Client-Side)

### Step 5.1: Modify `fity/app/(app)/chat.tsx`

In `handleSend()` (~line 160), add check before sending:

```typescript
const { canSendMessage, incrementMessageCount, isPremium } = useSubscriptionStore();

const handleSend = async (text: string, imageUri?: string) => {
  if (!canSendMessage()) {
    // Show paywall or limit sheet
    router.push('/(app)/paywall');
    return;
  }

  incrementMessageCount();
  // ... existing send logic
};
```

### Step 5.2: Add message count display in `ChatInputBar.tsx`

Show remaining messages for free users:
- "4 messages left today" (subtle, muted text above input)
- Hidden when premium

**Files to modify:**
- `fity/app/(app)/chat.tsx` (modify — add canSendMessage check)
- `fity/src/components/chat/ChatInputBar.tsx` (modify — add remaining count)

---

## Phase 6: Backend — Server-Side Message Gating

### Step 6.1: Add subscription fields to User model

Modify `backend/prisma/schema.prisma`:
```prisma
model User {
  // ... existing fields
  subscription_status  String    @default("free")  // free | trial | active | expired | cancelled
  subscription_tier    String    @default("free")  // free | pro
  subscription_expires DateTime?
  daily_message_limit  Int       @default(5)
  adapty_profile_id    String?
}
```

Run migration:
```bash
cd backend
source venv/bin/activate
prisma migrate dev --name add_subscription_fields
```

### Step 6.2: Add message counting in chat endpoint

Modify `backend/routes/chat.py` — in `/stream` endpoint, before processing:

```python
# Count today's user messages
from datetime import date, datetime

today_start = datetime.combine(date.today(), datetime.min.time())
message_count = await prisma.chatmessage.count(
    where={
        "user_id": db_user.id,
        "role": "user",
        "created_at": {"gte": today_start}
    }
)

if db_user.subscription_tier == "free" and message_count >= db_user.daily_message_limit:
    return JSONResponse(
        status_code=429,
        content={"error": "daily_limit_reached", "limit": db_user.daily_message_limit}
    )
```

### Step 6.3: Create webhook endpoint — `backend/routes/subscription.py`

New router for Adapty webhooks:

```python
# POST /api/webhooks/adapty
# Handles: subscription_started, subscription_renewed, subscription_expired,
#          trial_started, trial_converted, trial_expired,
#          subscription_renewal_cancelled, subscription_refunded
```

**Event handling:**
| Event | Action |
|-------|--------|
| `subscription_started` / `trial_converted` | Set tier=pro, status=active, update expires |
| `trial_started` | Set tier=pro, status=trial, update expires |
| `subscription_renewed` | Update expires, status=active |
| `subscription_expired` / `trial_expired` | Set tier=free, status=expired |
| `subscription_renewal_cancelled` | Set status=cancelled (keep access until expires) |
| `subscription_refunded` | Set tier=free, status=free immediately |

**Security:** Verify webhook via Authorization header (configured in Adapty dashboard).

### Step 6.4: Add subscription status to user endpoints

Modify `backend/routes/users.py`:
- `/sync` response: include `subscription_tier`, `subscription_status`
- `/me` response: include subscription info

### Step 6.5: Add config vars

Modify `backend/config.py`:
```python
ADAPTY_WEBHOOK_SECRET = os.getenv("ADAPTY_WEBHOOK_SECRET", "")
```

**Files to create/modify:**
- `backend/prisma/schema.prisma` (modify — add subscription fields)
- `backend/routes/chat.py` (modify — add message counting + 429 response)
- `backend/routes/subscription.py` (new — webhook endpoint)
- `backend/main.py` (modify — register subscription router)
- `backend/routes/users.py` (modify — include subscription in response)
- `backend/config.py` (modify — add ADAPTY_WEBHOOK_SECRET)

---

## Phase 7: Google Play Console Setup (Manual — User Does This)

### Step 7.1: Prerequisites
- Google Play Developer account ($25 one-time fee)
- App uploaded to at least Internal Testing track (need one AAB)

### Step 7.2: Upload first AAB via EAS
```bash
cd fity
eas build --platform android --profile preview
# Then upload the AAB to Google Play Console → Internal Testing
```

### Step 7.3: Create Subscription Products
1. Google Play Console → Monetize → Products → Subscriptions
2. Create `fity_pro_monthly`:
   - Product ID: `fity_pro_monthly`
   - Name: "Fity Pro Monthly"
   - Add Base Plan → Auto-renewing, $9.99/month
   - Add Offer → Free Trial, 7 days, new customers only
   - Activate
3. Create `fity_pro_annual`:
   - Product ID: `fity_pro_annual`
   - Name: "Fity Pro Annual"
   - Add Base Plan → Auto-renewing, $59.99/year
   - Add Offer → Free Trial, 7 days, new customers only
   - Activate

### Step 7.4: Set Up License Testing
1. Google Play Console → Settings → License testing
2. Add your test email(s)
3. License type: "RESPOND_NORMALLY"

### Step 7.5: Create Google Play Service Account Key
1. Google Cloud Console → IAM & Admin → Service Accounts
2. Create account: "adapty-billing"
3. Grant roles: "Pub/Sub Admin"
4. Create Key → JSON → Download
5. Google Play Console → Settings → API Access → Link project
6. Grant service account: "Financial data" + "Manage orders and subscriptions"
7. **Wait 24-48 hours** for key activation (or update any in-app product description to speed up)

### Step 7.6: Configure Adapty Dashboard
1. App Settings → Android → Upload Service Account JSON key
2. Products → Add `fity_pro_monthly` and `fity_pro_annual`
3. Paywalls → Create "coach-upgrade" paywall (or use custom from Phase 4)
4. Placements → Create "coach-upgrade-placement" → Link paywall
5. Integrations → Webhooks → Set URL: `https://your-api.com/api/webhooks/adapty`
6. Set Authorization header secret

### Step 7.7: Testing Flow
1. Install dev build on real Android device
2. Login with license tester email
3. Send 5 messages → paywall appears
4. Tap "Subscribe" → Google Play test payment sheet
5. Complete test purchase (no real charge)
6. Verify: messages now unlimited
7. Check Adapty dashboard for subscription event

---

## Phase 8: Dev Testing Without Google Play (Immediate)

While Google Play setup is pending, test the entire flow locally:

### Dev Toggle in `adapty.ts`:
```typescript
// Set to true → app acts as premium (skip paywall)
// Set to false → app acts as free (hits paywall at 5 msgs)
const DEV_FORCE_PREMIUM = false;
```

### Test scenarios:
1. **Free user flow:** Send 5 messages → limit sheet appears → tap upgrade → paywall screen → (in dev, toggle premium) → unlimited
2. **Premium user flow:** Toggle `DEV_FORCE_PREMIUM = true` → no limit, no paywall
3. **Server-side:** Test 429 response from `/api/chat/stream` when limit hit
4. **Webhook:** Use Adapty dashboard "Test webhook" button to send test events

---

## Implementation Order

| Step | What | Time Est | Blocked By |
|------|------|----------|------------|
| 1 | Install SDK + configure Expo (Phase 1) | 10 min | Nothing |
| 2 | Create adapty.ts service (Phase 2.1) | 10 min | Step 1 |
| 3 | Init in _layout.tsx (Phase 2.2-2.3) | 10 min | Step 2 |
| 4 | Create subscriptionStore (Phase 3) | 15 min | Step 2 |
| 5 | Create paywall screen (Phase 4) | 25 min | Step 4 |
| 6 | Wire message gating in chat (Phase 5) | 15 min | Step 4, 5 |
| 7 | Backend: schema + migration (Phase 6.1) | 10 min | Nothing |
| 8 | Backend: message counting (Phase 6.2) | 15 min | Step 7 |
| 9 | Backend: webhook endpoint (Phase 6.3) | 20 min | Step 7 |
| 10 | Backend: update user endpoints (Phase 6.4-6.5) | 10 min | Step 7 |
| 11 | Google Play setup (Phase 7) | User does manually | Step 1 |
| 12 | End-to-end testing (Phase 8) | 15 min | Steps 1-10 |

**Steps 1-6 (frontend) and 7-10 (backend) can be done in parallel.**

---

## Verification

### Client-side checks:
- [ ] Adapty initializes without errors (check verbose logs)
- [ ] `DEV_FORCE_PREMIUM = false`: 6th message shows paywall
- [ ] `DEV_FORCE_PREMIUM = true`: unlimited messages
- [ ] Paywall screen renders correctly (dark theme, lime accent)
- [ ] Message count resets at midnight
- [ ] "X messages left" shows in chat input area
- [ ] Paywall close button works

### Server-side checks:
- [ ] `POST /api/chat/stream` returns 429 when free user exceeds limit
- [ ] 429 response includes `{"error": "daily_limit_reached", "limit": 5}`
- [ ] Premium users (subscription_tier=pro) bypass limit
- [ ] `POST /api/webhooks/adapty` processes test events correctly
- [ ] User subscription fields update on webhook events
- [ ] `/api/users/me` returns subscription status

### End-to-end (after Google Play setup):
- [ ] Real Android device: test purchase flow works
- [ ] Adapty dashboard shows subscription event
- [ ] Webhook fires and updates backend
- [ ] User immediately gets unlimited access after purchase
