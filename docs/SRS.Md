SOFTWARE REQUIREMENTS SPECIFICATION
AI-Enabled Library Management System
Document Version: 1.0
Status: Draft for Review

1. SHORT PROJECT INTRODUCTION
   The Library Management System is a web-based platform that digitizes and automates library operations for a school, college, university, or corporate library. It solves the problem of manual, error-prone tracking of books, members, and transactions by giving the library one reliable system of record. It manages books, members, issue/return, fines, reservations, shelves, reports, and study-seat booking. AI is integrated only where it genuinely helps — search, recommendations, insights, and an assistant — while all critical transactions (issue, return, fines, bookings) remain rule-based, validated, and secure.
2. OVERALL PROJECT FLOW
   Overall Flow: Login → Role Verification → Role Dashboard → User selects a module → System validates the action → Data is processed/stored → Result is shown → Notification/Audit is updated where required
   Every user logs in and the system checks their role (Admin, Librarian/Staff, or Member). Based on the role, a specific dashboard and set of modules is shown. When the user performs an action, the system always validates it against business rules before saving anything — nothing is written to official records without passing validation. Once processed, the result is shown to the user, and a notification and/or audit log entry is created if the action is significant. This same pattern applies consistently across every module in the system.
   Library Flow: Book Added → Copy Available → Member Searches → Book Issued/Reserved → Due Date → Renew/Return → Overdue/Fine if applicable → Transaction Completed
   Seat Flow: Select Date/Time → Choose AC/Non-AC → Check Available Seat → Book → Validate Double Booking → Confirmation
3. TECHNOLOGY STACK
   • Frontend — React + TypeScript — builds the user interface for all three roles.
   • Backend — NestJS + TypeScript — handles business logic, validation, and APIs.
   • Database — MongoDB — stores books, members, transactions, and system data.
   • API — REST APIs — connects frontend and backend securely.
   • Authentication — JWT + Role-Based Access Control — verifies identity and restricts access by role.
   • AI Layer — AI/LLM integration — powers search, recommendations, insights, and the assistant.
   • Responsive UI — Works on Desktop, Tablet, and Mobile.
4. USER ROLES AND MODULES
   4.1 ADMIN ROLE
   Role: Admin manages the overall system, user access, permissions, policies, reports, audit logs, and AI settings.
   • Dashboard — Shows total books, members, issued books, overdue books, fines, reservations, and seat utilization. AI can provide a short management summary and trend alerts.
   • User Management — Create/manage Librarian/Staff accounts and manage account status.
   • Permissions — Control which operational functions a Librarian/Staff account can access.
   • System Settings — Configure loan periods, borrowing limits, fine rules, holidays, reservation and seat policies.
   • Reports — View management-level reports for books, circulation, fines, members, and seats. AI may summarize report trends.
   • Audit Logs — View important system activity and changes; entries cannot be edited or deleted by anyone.
   • AI Settings — Enable/disable AI features and monitor AI usage/errors.
   4.2 LIBRARIAN / STAFF ROLE
   Role: Librarian / Staff handles the daily operational work of the library, including books, members, circulation, fines, reservations, shelves, seats, and operational reports.
   • Dashboard — Books due today, overdue, pending reservations, seat bookings. AI gives a daily-priority insight.
   • Book Management — Add/edit book details. AI suggests metadata, category, and flags possible duplicates — staff always confirms before saving.
   • Book Copy Management — Track each physical copy: accession number, barcode, condition, status (Available/Issued/Reserved/Lost/Damaged/Maintenance).
   • Category/Author/Publisher — Maintain clean, non-duplicate catalogue reference data.
   • Member Management — Add/edit members, set member type (Student/Teacher/Faculty/Employee/General), manage status and borrowing eligibility.
   • Issue / Return / Renewal — Issue books after checking member eligibility and copy availability; renew within limits; return updates copy status and closes the transaction.
   • Due Date & Overdue — Due date is auto-calculated from policy; overdue status is automatic, never manually set. AI predicts overdue risk to help prioritize follow-ups.
   • Fine Management — Fine is always calculated by fixed rules (days × rate, capped). Staff can record payment or waive with a logged reason. AI can explain a fine in plain language or flag unusual patterns, but never changes a fine itself.
   • Reservations — Manage the waitlist queue and pickup window. AI suggests estimated wait time and similar available books.
   • Shelf / Rack Management — Track book locations. AI suggests better placement based on demand.
   • Seat Management — Add/manage seats, mark maintenance/disabled.
   • Seat Booking — Book seats on a member's behalf; system blocks double-booking automatically. AI can recommend a seat based on demand patterns.
   • Operational Reports — Books, members, issues, returns, overdue, fines, reservations, seats.
   AI only assists here — it never directly issues/returns books, changes fines, or edits official records.
   4.3 MEMBER ROLE
   Role: Member is the registered library user who searches books, tracks borrowed books, manages reservations and fines, books seats, receives notifications, and uses AI-assisted services.
   • Dashboard — Borrowed books, due dates, fines, reservations, seat bookings, recommendations.
   • Book Search — Search by title, author, ISBN, category, and availability.
   • Book Details — View full book info, availability, and location.
   • AI Search — Member can search naturally, such as "Show me beginner React books." Falls back to normal keyword search if AI is unavailable.
   • Recommendations — Suggest books based on interests/history, with a stated reason and fallback to popular/new books; personalization can be turned off.
   • My Borrowed Books — View issued books, due dates, and renewal availability.
   • My Reservations — Place, track, and cancel reservations.
   • My Fines — View fine amount and reason; AI can explain how the fine was calculated.
   • Seat Booking — Select date/time, AC or Non-AC seat, view price and availability, then book.
   • My Bookings — View and cancel upcoming seat bookings.
   • Notifications — Due date, overdue, fine, reservation, and booking alerts.
   • AI Assistant — Ask questions like "When is my book due?" or "Which seats are available?"
   • Profile — Manage personal details, password, and notification/AI preferences.
5. IMPORTANT CORE FLOWS
   Book Issue Flow: Member → Book Availability Check → Member Eligibility Check → Issue Book → Due Date → Notification
   Renewal Flow: Open Loan → Renewal Rule Check → No Conflicting Reservation → New Due Date
   Return & Fine Flow: Return Book → Compare Return Date with Due Date → Fine Calculated if Overdue → Copy Available/Reserved → Transaction Closed
   Reservation Flow: Unavailable Book → Member Reserves → Waitlist → Copy Available → Member Notified → Pickup/Issue
   Seat Booking Flow: Date/Time → Seat Type → Available Seats → Select Seat → Validate → Confirm Booking
   The validation step blocks past dates, outside working hours, over-limit duration, and double-booking. Even if two members try to book the same seat/slot at the same time, only one succeeds.
   AI Flow: User Query/Data → AI Analysis → Suggestion/Answer → User Reviews → Critical actions still pass normal system validation
6. AI IN THE WHOLE SYSTEM
   • Smart book search
   • Personalized recommendations
   • Book metadata/category suggestions
   • Duplicate book detection
   • Overdue-risk prediction
   • Fine explanation
   • Reservation alternatives/wait-time estimate
   • Shelf placement suggestion
   • Seat recommendation
   • Dashboard insights
   • Report summaries
   • Role-aware AI Library Assistant
   AI is an assistant, not the final authority. Issue/return, due dates, official fine calculation, permissions, booking validation, and official record changes remain deterministic and rule-based.
   If any AI feature is unavailable, the system keeps working normally through its non-AI equivalent, such as keyword search, standard fine breakdown, or default seat list.
7. FINAL OVERALL PROJECT SUMMARY
   Our Library Management System has three users: Admin, Librarian/Staff, and Member. Admin manages the overall system, settings, users, and reports. Librarian handles daily library operations such as books, members, issue-return, fines, reservations, shelves, and seats. Member uses the system to search books, track borrowed books, reserve books, view fines, and book seats. AI is integrated in search, recommendations, insights, and assistance, but important transactions remain secure and rule-based. The frontend uses React with TypeScript, the backend uses NestJS, and MongoDB stores the application data.
