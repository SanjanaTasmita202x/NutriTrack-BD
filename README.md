# NutriTrack BD


=======
### Localized Nutrition & Health Companion for Bangladeshi Foods
>>>>>>> 4b6dcce6d20a80fcdd49df7f9b055237b827b6f9

NutriTrack BD is a lightweight, culturally tailored web application designed for nutrition tracking, calorie management, and dietary health monitoring for Bangladeshi adults. Built as a university CSE Software Development Lab project, it bridges the gap between clinical nutrition principles and authentic Bangladeshi culinary habits.

---

## Project Overview

Most global calorie-tracking applications rely on Western food databases, making them impractical for typical Bangladeshi meals. NutriTrack BD solves this by providing localized nutritional data for common Bangladeshi dishes alongside clinically sound metabolic calculations.

The application operates in dual modes:
* **Guest Mode:** Immediate, client-side calculations (BMI, BMR/TDEE) and local storage tracking without requiring an account.
* **Authenticated Mode:** Cloud data persistence, multi-day meal logs, weight tracking, and profile management secured via Supabase Auth and PostgreSQL Row Level Security (RLS).

---

## Key Features

* **Food Library (85+ Bangladeshi foods):** Authentic staples, fish, lentils (*dal*), meats, vegetables, and snacks with English and Bengali names, serving guides, and calorie counts per 100g.
* **Food Log & Food History:** Daily meal logging categorized by Breakfast, Lunch, Dinner, and Snacks with gram-based portion calculations, real-time daily totals, and past history navigation.
* **BMI Calculator:** Fast, client-side Body Mass Index ($kg/m^2$) calculation categorized using WHO standard adult thresholds (Underweight, Normal, Overweight, Obese).
* **BMR Calculator:** Mifflin-St Jeor formula calculating Basal Metabolic Rate and Total Daily Energy Expenditure (TDEE) across 5 activity levels and goals (Weight Loss, Maintenance, Weight Gain), protected by calorie safety floors ($1,200\text{ kcal}$ for females, $1,500\text{ kcal}$ for males). Authenticated adult calculations are persisted via a PostgreSQL RPC function.
* **Weight History & Progress Graph:** Date-based weight logging (CRUD), dynamic progress indicators, starting vs. current weight delta, and an SVG progress graph unlocked after logging 5 or more entries.
* **Nutrition Care (Weight Loss & Weight Gain):** Curated dietary guidance highlighting high-protein, nutrient-dense, and fiber-rich Bangladeshi foods tailored to personal fitness goals.
* **Diabetes & Cholesterol Guides:** Evidence-based dietary tips focusing on low-GI complex carbohydrates, lean freshwater fish, and heart-healthy lifestyle choices.
* **Authentication & Account Isolation:** Secure sign-up, sign-in, automatic session restoration, and strict tenant data isolation.

---

## Technologies Used

* **Frontend:**
  * **HTML5:** Semantic markup and accessible single-page view structure.
  * **CSS3:** Custom responsive design system, mobile-first layouts, and CSS variables.
  * **Vanilla JavaScript (ES6+):** Modular client-side architecture without external UI frameworks.
* **Backend & Database:**
  * **Supabase:** Managed Backend-as-a-Service (BaaS) providing authentication and cloud storage.
  * **PostgreSQL 15+:** Relational database with Row Level Security (RLS) and stored procedures (PL/pgSQL RPC).
  * **Supabase JS Client v2:** Integrated via official CDN (`@supabase/supabase-js@2`).

---

## Project Structure

```text
NutriTrack main BD/
├── index.html                   # Single-Page Application (SPA) entry point
├── css/                         # Modular CSS stylesheets
│   ├── auth.css                 # Authentication modal and forms
│   ├── calculator.css           # BMI and BMR card layouts
│   ├── food.css                 # Food library grid and cards
│   ├── foodLog.css              # Daily meal log and calorie counters
│   ├── guide.css                # Dietary guide views
│   ├── history.css              # Weight history and progress styles
│   ├── home.css                 # Home landing screen layout
│   ├── profile.css              # User profile setup
│   └── style.css                # Global design tokens and base styles
├── js/                          # Modular JavaScript files
│   ├── Supabase.js              # Supabase client configuration
│   ├── validation.js            # Input sanitization and validators
│   ├── auth.js                  # Authentication lifecycle and session handlers
│   ├── profile.js               # Profile state and cloud synchronization
│   ├── food.js                  # Localized Bangladeshi food database
│   ├── foodLog.js               # Daily food logging and history CRUD
│   ├── history.js               # Weight history CRUD and graph rendering
│   ├── diabetesGuide.js         # Diabetes dietary guide renderer
│   ├── cholesterolGuide.js      # Cholesterol dietary guide renderer
│   ├── nutritionCare.js         # Weight management recommendations
│   ├── bmi.js                   # Client-side BMI calculator
│   ├── bmr.js                   # Client-side BMR & calorie safety engine
│   ├── calculatorService.js     # Background RPC bridge for BMR history
│   ├── home.js                  # Home view interactions
│   └── app.js                   # Router, view transitions, and app initialization
└── docs/                        # Project documentation
    ├── DATABASE_SETUP.md        # Database schema, RLS policies, and RPC setup
    ├── TESTING_AND_DEMO.md      # Evaluation guide, test scenarios, and checklists
    └── SECURITY_AND_ARCHITECTURE.md # System architecture and security model
```

---

## Setup & How to Run

NutriTrack BD runs on standard web technologies and requires no package installation (`npm`), compilers, or bundlers.

### Prerequisites
* Any modern web browser (Chrome, Firefox, Edge, Safari).
* (Optional) [VS Code](https://code.visualstudio.com/) with the **Live Server** extension.

### Running Locally
1. Clone or download the repository to your local machine.
2. **Method 1 (Recommended — Local Server):**
   * Open the project directory in VS Code.
   * Right-click `index.html` and select **"Open with Live Server"**.
   * The app will open at `http://127.0.0.1:5500`.
3. **Method 2 (Direct Browser Open):**
   * Double-click `index.html` to open it directly in your web browser.

---

## Database Schema & Security

The cloud database is hosted on Supabase (PostgreSQL 15+) with Row Level Security (RLS) enabled on all tables:

| Table | Primary Key | Foreign Key | Purpose | RLS Policy |
| :--- | :--- | :--- | :--- | :--- |
| `public.profiles` | `id (UUID)` | `auth.users(id)` | User demographics (age, gender, height, weight) | `auth.uid() = id` |
| `public.food_logs` | `id (UUID)` | `auth.users(id)` | Daily meal logs, portion sizes, and calories | `auth.uid() = user_id` |
| `public.weight_logs` | `id (UUID)` | `auth.users(id)` | Periodic weight records and dates | `auth.uid() = user_id` |
| `public.calculator_history` | `id (UUID)` | `auth.users(id)` | Audit log of calculated BMR/TDEE targets | `auth.uid() = user_id` (via RPC) |

> For complete SQL migration scripts and setup steps, see [`docs/DATABASE_SETUP.md`](docs/DATABASE_SETUP.md).

---

## Evaluator Quick Walkthrough

For demonstration or lab evaluation:
1. Open the app and click **Account $\rightarrow$ Sign In** (or **Sign Up** to create a test account).
2. Complete **Profile Setup** with sample adult metrics (e.g., Age: 25, Height: 170 cm, Weight: 65 kg).
3. Open **Calculator $\rightarrow$ BMR / Calorie Needs**, select an activity level and goal, and compute target calories.
4. Go to **Daily Food Log**, choose a meal, select a local food (e.g., *Roti* or *Khichuri*), enter portion grams, and verify the live calorie summation.
5. Open **Weight History**, log weight entries, and observe the summary cards and graph unlock threshold (5 entries).
6. Explore the **Food Library**, **Nutrition Care**, and **Health Guides** to inspect localized food recommendations.
7. Click **Account $\rightarrow$ Sign Out** to confirm session teardown and account data isolation.

---

## Medical Disclaimer

NutriTrack BD is an educational and personal health tracking project. Calculations (Mifflin-St Jeor equation, WHO BMI standards) and dietary suggestions are provided for informational purposes only and do not replace professional medical advice, diagnosis, or clinical treatment.
