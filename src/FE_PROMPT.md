## 🎯 Goal
Build the user interface (UI) for a Waste Collection & Recycling Management System serving four main user roles: **Citizen, Recycling Enterprise, Collector, Administrator**. The frontend should be user-friendly, intuitive, and support real-time status, GPS maps, image upload, dashboards, and leaderboards.

---
## 👤 Personas & Roles

### 1. Citizen
- Report waste/recyclables for collection (photo + GPS + description)
- Track report status: Pending / Accepted / Assigned / Collected
- Classify waste at source (Organic / Recyclable / Hazardous…)
- Earn reward points for valid and correctly classified reports
- View points history & regional leaderboard
- Submit feedback or complaints

### 2. Recycling Enterprise
- Manage processing capacity: waste types, capacity, service areas
- Receive & decide to accept/reject collection requests
- View prioritized request suggestions (optional)
- Assign requests to Collectors
- Track progress in real time
- View collection & recycling reports
- Configure reward point rules

### 3. Collector
- Receive assigned collection requests
- Update status: Assigned / On the way / Collected
- Confirm completion with photos
- View work history

### 4. Administrator
- Manage accounts & roles
- Monitor overall system activity
- Resolve disputes & complaints

---
## 🧭 Core User Flows

### Citizen Flow
1. Login / Register
2. Create Waste Report
   - Upload photo
   - Capture current GPS location (map picker)
   - Select waste type
   - Add description
   - (Optional) AI waste type suggestion
3. Submit report → status Pending
4. Track real-time status
5. Receive reward points when Collected
6. View history & leaderboard
7. Submit feedback/complaint

### Enterprise Flow
1. Login
2. Configure processing capacity
3. View matching requests
4. Accept / Reject
5. Assign to Collector
6. Track progress
7. View dashboard & reports

### Collector Flow
1. Login
2. View assigned tasks
3. Start task → On the way
4. Collect waste → upload confirmation photo
5. Complete task → Collected

### Admin Flow
1. Login
2. Manage users & roles
3. Monitor system
4. Handle complaints

---
## 🖥️ Screens to Build

### Common
- Login / Register
- Profile
- Notification Center

### Citizen UI
- Home + Map
- Create Report
- Report Detail + Status Timeline
- Points History
- Leaderboard
- Feedback / Complaint Form

### Enterprise UI
- Dashboard
- Capacity Configuration
- Requests List
- Request Detail + Assign
- Collector Management
- Reports & Analytics
- Reward Rules Configuration

### Collector UI
- Task List
- Task Detail
- Update Status
- Upload Confirmation
- Work History

### Admin UI
- User Management
- System Monitoring
- Complaints Handling

---
## 🧩 Suggested Components

- MapPicker (Google Maps / Mapbox)
- ImageUploader
- StatusBadge
- Timeline
- LeaderboardTable
- RealtimeStatusIndicator (WebSocket)
- Charts (volume, points, performance)
- Modal Confirm / Reject

---
## 🔌 API Integration (Assumed)

- POST /auth/login
- POST /reports
- GET /reports/{id}
- PATCH /reports/{id}/status
- GET /leaderboard
- POST /feedback
- GET /enterprise/requests
- PATCH /enterprise/requests/{id}/assign
- GET /collector/tasks
- PATCH /collector/tasks/{id}/status
- GET /admin/users

---
## 🤖 AI Decision Support (Optional)

- Endpoint: POST /ai/classify
- Input: image
- Output: suggestedType (Organic / Recyclable / Hazardous)
- UI: Display suggestion → user confirms or overrides

---
## ⚙️ Tech Constraints

- Responsive (mobile-first)
- Support real-time updates (WebSocket / SSE)
- Image compression before upload
- GPS permission handling
- Offline mode (optional)

---
## 🎨 UX Notes

- Clear status colors (Pending: gray, Accepted: blue, Assigned: orange, Collected: green)
- Waste reporting in max 3 steps
- Show collection progress as a timeline
- Leaderboard filters by region/time

---
## 📦 Expected Output from FE Developer

- Wireframes / UI mockups
- Component list
- Routing map
- State management plan
- API integration plan
- Real-time update strategy

---
## ❓ Open Questions

- Target platform: Web / Mobile / Both?
- Map service: Google Maps or Mapbox?
- Real-time: WebSocket or polling?
- Is AI classification enabled by default?

---
## ✅ Success Criteria

- Citizen submits a report in < 1 minute
- Collector updates status in < 2s
- Enterprise processes a request in < 5 actions
- Admin monitors system in real time

---
*This prompt is intended for FE developers to quickly understand scope, flows, and UI responsibilities.*

