# PostHog Setup Guide for EasyAsk

## Your Events Reference

### Widget Events (Visitor-Facing)
| Event | Properties |
|-------|------------|
| `widget_opened` | `page_url` |
| `conversation_started` | `page_url`, `conversation_id` |
| `widget_closed` | `page_url`, `conversation_id`, `message_count` |
| `response_copied` | `page_url`, `conversation_id`, `response_length` |
| `conversation_copied` | `page_url`, `conversation_id`, `message_count` |
| `feedback_submitted` | `feedback_type` (positive/negative), `session_id`, `page_url`, `message_count` |
| `escalation_form_opened` | `page_url`, `conversation_id`, `message_count` |
| `escalation_submitted` | `session_id`, `page_url`, `message_count` |

### Admin Events
| Event | Properties |
|-------|------------|
| `admin_dashboard_viewed` | (none) |
| `admin_page_filtered` | `page_title`, `page_url` |
| `conversation_expanded` | `session_id` |

---

## DASHBOARD 1: Widget Performance

### How to Create:
1. Go to **Dashboards** → **New dashboard**
2. Name it "Widget Performance"
3. Add each insight below using **+ Add insight**

### Insight 1: Widget Opens Over Time
- **Type**: Trends
- **Event**: `widget_opened`
- **Display**: Line chart
- **Date range**: Last 30 days
- **Breakdown by**: `page_url` (optional - to see which pages)

### Insight 2: Conversation Completion Rate
- **Type**: Funnels
- **Steps**:
  1. `widget_opened`
  2. `conversation_started`
  3. `widget_closed` → click `≡ •••` next to this step → add filter: `message_count` > 0
- **Conversion window**: 1 hour
- **Note**: Add the filter on the step itself, NOT in the global "Filters" section at the bottom (global filters apply to all steps)

### Insight 3: Feedback Distribution
- **Type**: Trends
- **Event**: `feedback_submitted`
- **Breakdown by**: `feedback_type`
- **Display**: Bar chart or Pie chart
- Shows: positive vs negative thumbs

### Insight 4: Escalation Rate
- **Type**: Funnels
- **Steps**:
  1. `conversation_started`
  2. `escalation_submitted`
- **Display**: Shows % of conversations that escalate

### Insight 5: Top Pages by Widget Activity
- **Type**: Trends
- **Event**: `widget_opened`
- **Breakdown by**: `page_url`
- **Display**: Table
- **Sort by**: Total count (descending)

### Insight 6: Average Messages Per Session
- **Type**: Trends
- **Event**: `widget_closed`
- **Math**: Average of `message_count` property
- **Display**: Number or Line chart

---

## DASHBOARD 2: Conversion Funnels

### Funnel 1: Full Widget Journey
- **Type**: Funnels
- **Steps**:
  1. `widget_opened` - Visitor sees widget
  2. `conversation_started` - Starts talking
  3. `feedback_submitted` - Rates experience
- **Conversion window**: 1 hour
- **Breakdown by**: `page_url` (to see which pages convert best)

### Funnel 2: Escalation Path
- **Type**: Funnels
- **Steps**:
  1. `conversation_started`
  2. `escalation_form_opened` - Clicked "Need more help?"
  3. `escalation_submitted` - Submitted email
- **Conversion window**: 30 minutes

### Funnel 3: Engagement Depth
- **Type**: Funnels
- **Steps**:
  1. `widget_opened`
  2. `conversation_started`
  3. `response_copied` OR `conversation_copied`
- Shows: How many visitors found answers worth saving

### Funnel 4: Widget to Positive Feedback
- **Type**: Funnels
- **Steps**:
  1. `widget_opened`
  2. `conversation_started`
  3. `feedback_submitted` (filter: `feedback_type` = `positive`)
- Shows: % of widget opens that result in happy visitors

### Funnel 5: Negative Feedback to Escalation
- **Type**: Funnels
- **Steps**:
  1. `feedback_submitted` (filter: `feedback_type` = `negative`)
  2. `escalation_form_opened`
  3. `escalation_submitted`
- Shows: Do unhappy users escalate?

---

## DASHBOARD 3: Admin Activity

### Insight 1: Daily Active Admins
- **Type**: Trends
- **Event**: `admin_dashboard_viewed`
- **Math**: Unique users
- **Display**: Line chart

### Insight 2: Admin Page Filters Used
- **Type**: Trends
- **Event**: `admin_page_filtered`
- **Breakdown by**: `page_title`
- Shows: Which pages admins look at most

### Insight 3: Conversations Reviewed
- **Type**: Trends
- **Event**: `conversation_expanded`
- **Math**: Total count
- Shows: Admin engagement with conversations

---

## ALERTS Setup

### Alert 1: High Escalation Rate
1. Go to **Data Management** → **Actions** → **New action**
2. Or: Create an Insight first, then click **...** → **Subscribe** → **Create alert**
3. **Condition**: `escalation_submitted` count / `conversation_started` count > 20%
4. **Frequency**: Daily
5. **Notify**: Your email

### Alert 2: Widget Opens Drop
1. Create Trends insight for `widget_opened`
2. Click **...** → **Subscribe**
3. **Alert type**: "Decreases by more than 50%"
4. **Compare to**: Previous 7 days
5. **Frequency**: Daily

### Alert 3: Negative Feedback Spike
1. Create Trends insight for `feedback_submitted` where `feedback_type` = `negative`
2. Subscribe with alert: "Increases by more than 100%"
3. **Compare to**: Previous 7 days

---

## SESSION RECORDINGS Filters

### How to Access:
1. Go to **Session Replay** in left sidebar
2. Click **Add filter**

### Filter 1: Escalated Sessions (Watch Confused Users)
- **Filter**: Events → `escalation_submitted` → performed event
- **Why**: See exactly what led users to need human help

### Filter 2: Negative Feedback Sessions
- **Filter**: Events → `feedback_submitted` → where `feedback_type` = `negative`
- **Why**: Watch what went wrong

### Filter 3: Highly Engaged Users (2+ minutes)
- **Filter**: Recording duration → greater than → 120 seconds
- **Why**: See what keeps users engaged

### Filter 4: Multi-Message Conversations
- **Filter**: Events → `widget_closed` → where `message_count` > 5
- **Why**: Watch power users

### Filter 5: Copy Actions (Found Useful Info)
- **Filter**: Events → `response_copied` → performed event
- **Why**: See what answers were valuable enough to save

---

## QUICK START: Minimum Viable Setup

If you're short on time, create just these 3:

### 1. Widget Funnel (5 min)
- Funnels → `widget_opened` → `conversation_started` → `feedback_submitted`

### 2. Escalation Tracker (3 min)
- Trends → `escalation_submitted` → Line chart → Last 30 days

### 3. Session Filter for Problems (2 min)
- Session Replay → Filter by `escalation_submitted` event

---

## Adding Insights to Dashboard

After creating any insight:
1. Click **Save** (top right)
2. Choose **"Add to dashboard"**
3. Select your dashboard (e.g., "Widget Performance")
4. The insight now appears on your dashboard

To rearrange:
1. Go to the dashboard
2. Click **Edit layout**
3. Drag insights to reorder
4. Click **Done**
