Library Management System — SRS 
Software Requirements Specification
1.  Project Introduction
The Library Management System is a web-based platform that digitizes and automates library operations for a school, college, university, or corporate library. It solves the problem of manual, error-prone tracking of books, members, and transactions by giving the library one reliable system of record. It manages books, members, issue/return, fines, reservations, shelves, reports, and study-seat booking. AI is integrated only where it genuinely helps — search, recommendations, insights, and an assistant — while all critical transactions (issue, return, fines, bookings) remain rule-based, validated, and secure.

2. Overall Project Flow

Login → Role Verification → Role Dashboard → User selects a module → System validates the action → Data is processed/stored → Result is shown → Notification/Audit is updated where required

Every user logs in and the system checks their role (Admin, Librarian/Staff, or Member). Based on the role, a 
specific dashboard and set of modules is shown. When the user performs an action, the system always validates 

it against business rules before saving anything — nothing is written to official records without passing validation. Once processed, the result is shown to the user, and a notification and/or audit log entry is created if the action is 
significant. This same pattern applies consistently across every module in the system.
Library flow: Book Added (with acquisition details) → Copy Added (Barcode/QR) & Available → Member Searches → Book Issued/Reserved → Due Date (holiday-aware) → Renew/Return (or marked Lost/Damaged) → Overdue/Fine if applicable → Transaction Completed
Seat flow: Select Date/Time → Choose AC/Non-AC → Check Available Seat → Book → Validate Double Booking → Confirmation
3. Technology Stack
•	Frontend: React + TypeScript — builds the user interface for all three roles.
•	Backend: NestJS + TypeScript — handles business logic, validation, and APIs.
•	Database: MongoDB — stores books, members, transactions, and system data.
•	API: REST APIs — connects frontend and backend securely.
•	Authentication: JWT + Role-Based Access Control — verifies identity and restricts access by role.
•	AI Layer: AI/LLM integration — powers search, recommendations, insights, and the assistant.
•	Responsive UI: Works on Desktop, Tablet, and Mobile.
4. User Roles and Module Flow
1. Admin
Admin Login → Admin Dashboard → Manage Users/Permissions/Policies → View Reports & Audit → Manage AI Settings
•	Dashboard — Shows total books, members, issued books, overdue books, fines, reservations, and seat utilization. AI can provide a short management summary and trend alerts.
•	User Management — Create/manage Librarian/Staff accounts and manage account status.
•	Permissions — Control which operational functions a Librarian/Staff account can access.
•	System Settings — Configure loan periods, borrowing limits, fine rules, reservation and seat policies, and the library holiday calendar (used by due-date and overdue calculations).
•	Reports — View management-level reports for books, circulation, fines, members, and seats; exportable to CSV/Excel and PDF with filtering and date-range support. AI may summarize report trends.
•	Audit Logs — View important system activity and changes; entries cannot be edited or deleted by anyone.
•	System Health Monitoring — View basic system health: API/application errors, notification delivery failures, and AI failure/fallback frequency — a simple status view, not a full DevOps module.
•	AI Settings — Enable/disable AI features, monitor AI usage/errors, and review aggregated AI feedback (Helpful/Not Helpful ratings) for quality monitoring.

2. Librarian / Staff

Librarian Login → Dashboard → Manage Books & Members → Issue/Renew/Return → Manage Fines/Reservations/Shelves/Seats → Reports
•	Dashboard — Books due today, overdue, pending reservations, seat bookings. AI gives a daily-priority insight.
•	Book Management — Add/edit book details, including basic acquisition tracking (purchased or donated, acquisition date, cost, vendor/source — no full procurement module). Supports bulk import of books via CSV/Excel with validation and a rejected-rows report, plus catalogue export. AI suggests metadata, category, and flags possible duplicates — staff always confirms before saving.
•	Book Copy Management — Track each physical copy: accession number, Barcode/QR, condition, and status (Available/Issued/Reserved/Lost/Damaged/Maintenance/Archived). Availability is always copy-level — a title is "available" only if at least one of its copies is Available. Copies are archived, not hard-deleted, so history is preserved. Includes the Lost/Damaged workflow: staff marks a copy Lost or Damaged, the configured charge applies automatically; if a lost book is later found, its status is restored per policy and the charge is reversed/adjusted with full audit history (old charge records are never silently deleted).
•	Category/Author/Publisher — Maintain clean, non-duplicate catalogue reference data.
•	Member Management — Add/edit members, set member type (Student/Teacher/Faculty/Employee/General), manage status, borrowing eligibility, and membership start/expiry with renewal per configured policy; deactivation archives rather than deletes the record. Staff can view a member's activity history (loans, fines, reservations, seat bookings) for operational support. Supports bulk import of members via CSV/Excel with validation and error reporting.
•	Issue / Return / Renewal — Issue books by scanning/selecting a copy's Barcode/QR, after checking member eligibility, membership validity, and copy availability; renew within limits; return updates copy status (including marking it Lost/Damaged if needed) and closes the transaction.
•	Due Date & Overdue — Due date is auto-calculated from policy and respects the library holiday calendar; overdue status is automatic, never manually set. AI predicts overdue risk to help prioritize follow-ups.
•	Fine Management — Fine is always calculated by fixed rules (days × rate, capped), including lost/damaged charges. Staff can record payment or waive with a logged reason; adjustments (including lost-book charge reversals) keep full history. AI can explain a fine in plain language or flag unusual patterns, but never changes a fine itself.
•	Reservations — Manage the waitlist queue and pickup window. AI suggests estimated wait time and similar available books.
•	Shelf / Rack Management — Track book locations. AI suggests better placement based on demand.
•	Seat Management — Add/manage seats, mark maintenance/disabled.
•	Seat Booking — Book seats on a member's behalf, checking membership validity first; system blocks double-booking automatically. AI can recommend a seat based on demand patterns.
•	Operational Reports — Books, members, issues, returns, overdue, fines, reservations, seats — exportable to CSV/Excel and PDF with filters and date ranges.
AI only assists here — it never directly issues/returns books, changes fines, or edits official records.


3. Member
Member Login → Dashboard → Search Books → View Availability → Reserve/Renew → View Fines → Book Seat → Notifications/Profile
•	Dashboard — Borrowed books, due dates, fines, reservations, seat bookings, recommendations.
•	Book Search — Search by title, author, ISBN, category, and availability. Member can view recent searches and save useful searches (optional convenience feature, respects privacy settings).
•	Book Details — View full book info, copy-level availability, and location.
•	AI Search — Member can search naturally, such as "Show me beginner React books." Shows a short confidence indicator for low-confidence results and falls back to normal keyword search if AI is unavailable. Member can mark a result Helpful/Not Helpful for AI quality monitoring (feedback never changes catalogue data).
•	Recommendations — Suggest books based on interests/history, each with a short reason ("Recommended because…") and fallback to popular/new books when personalization is off or AI is unavailable. Member can rate suggestions Helpful/Not Helpful.
•	My Borrowed Books — View current and past issued books, due dates, and renewal availability — full loan history.
•	My Reservations — Place, track, and cancel reservations; view reservation history.
•	My Fines — View fine amount, reason, and full fine history (including lost/damaged charges); AI can explain how a fine was calculated.
•	Seat Booking — Select date/time, AC or Non-AC seat, view price and availability, then book (blocked if membership has expired).
•	My Bookings — View, cancel, and review history of seat bookings.
•	Notifications — Due date, overdue, fine, reservation, membership expiry, and booking alerts, with configurable In-App, Email, and SMS preferences managed in Profile.
•	AI Assistant — Ask questions like "When is my book due?" or "Which seats are available?" Answers include a brief explanation of the reasoning where useful, and the member can flag a response Helpful/Not Helpful.
•	Profile — Manage personal details, password, notification preferences, and the AI personalization toggle — when disabled, borrowing/search history is excluded from recommendations and the system falls back to Popular Books/New Arrivals.
5. Important Core Flows
Book Issue Flow: Member → Scan/Select Copy (Barcode/QR) → Book Availability Check (copy-level) → Member Eligibility & Membership-Validity Check → Issue Book → Due Date (holiday-aware) → Notification
Renewal Flow: Open Loan → Renewal Rule Check → Membership-Validity Check → No Conflicting Reservation → New Due Date
Return & Fine Flow: Return Book → Compare Return Date with Due Date (holiday-aware) → Fine Calculated if Overdue → If Copy Reported Lost/Damaged, Apply Configured Charge → Copy Available/Reserved/Lost/Damaged → Transaction Closed (all charge and status changes keep full history — nothing is silently deleted)
Reservation Flow: Unavailable Book → Member Reserves → Waitlist → Copy Available → Member Notified → Pickup/Issue
Seat Booking Flow: Date/Time → Seat Type → Available Seats → Select Seat → Validate → Confirm Booking (the validation step blocks past dates, outside working hours, over-limit duration, and double-booking — even if two members try to book the same seat/slot at the same time, only one succeeds)
AI Flow: User Query/Data → AI Analysis → Suggestion/Answer → User Reviews → Critical actions still pass normal system validation
6. AI in the Whole System
•	Smart book search
•	Personalized recommendations
•	Book metadata/category suggestions
•	Duplicate book detection
•	Overdue-risk prediction
•	Fine explanation
•	Reservation alternatives/wait-time estimate
•	Shelf placement suggestion
•	Seat recommendation
•	Dashboard insights
•	Report summaries
•	Role-aware AI Library Assistant
•	User feedback (Helpful/Not Helpful) on AI suggestions, for quality monitoring only
•	Confidence indicators and short explanations on AI output — no fake certainty
AI is an assistant, not the final authority. Issue/return, due dates, official fine calculation, permissions, booking validation, and official record changes remain deterministic and rule-based. If any AI feature is unavailable, the system keeps working normally through its non-AI equivalent (e.g., keyword search, standard fine breakdown, default seat list). AI feedback and confidence scores are used only to monitor and improve AI quality — they never modify official library data.
7. Final Overall Project Summary
Our Library Management System has three users: Admin, Librarian/Staff, and Member. Admin manages the overall system, settings, users, and reports. Librarian handles daily library operations such as books, members, issue-return, fines, reservations, shelves, and seats. Member uses the system to search books, track borrowed books, reserve books, view fines, and book seats. AI is integrated in search, recommendations, insights, and assistance, but important transactions remain secure and rule-based. The frontend uses React with TypeScript, the backend uses NestJS, and MongoDB stores the application data.
