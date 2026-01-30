# AI Counsellor - Your AI-Powered Study Abroad Guide 🎓

An intelligent study abroad counseling platform powered by AI that guides students through their university application journey with personalized recommendations, automated task management, and smart university matching.

## 🌟 Overview

AI Counsellor is a comprehensive platform that helps students navigate the complex process of studying abroad. Using advanced AI technology, it provides personalized university recommendations, manages application timelines, and offers intelligent guidance throughout the entire journey.

### Key Highlights

- 🤖 **AI-Powered Counseling** with function calling - AI doesn't just talk, it takes actions
- 🎯 **Smart University Matching** - Dream/Target/Safe categorization based on your profile
- 📊 **Profile Strength Analysis** - AI-calculated readiness scores
- ✅ **Automated Task Generation** - Personalized to-do lists based on your stage
- 💬 **Dual Onboarding System** - Choose between manual form or AI-led conversation
- 🔒 **University Locking** - Commit to your choice and unlock application guidance

---

## 🚀 Features

### 1. **Landing Page**
- Clean, professional design
- Clear value proposition
- Quick access to signup/login

### 2. **Authentication**
- Email/password signup and login
- Google OAuth integration
- Secure session management with NextAuth

### 3. **Dual Onboarding System**
Students can choose between two onboarding modes:

#### Manual Onboarding
- 4-step guided form
- Collects academic background, study goals, budget, and test readiness

#### AI-Led Onboarding
- Conversational data collection
- Natural language processing
- Incremental profile building

**Data Collected:**
- Academic Background: Education level, major, GPA, graduation year
- Study Goals: Target degree, field, intake year, preferred countries
- Budget: Annual range, funding plan (self/scholarship/loan)
- Readiness: IELTS/TOEFL, GRE/GMAT, SOP status

### 4. **Dashboard (Control Center)**
Your central hub answering three key questions:
1. **Where am I?** - Current stage indicator with progress bar
2. **What should I do next?** - AI-generated action plan
3. **How strong is my profile?** - Visual strength analysis

**Components:**
- Profile summary card
- Profile strength analysis (Academics, Exams, SOP with circular progress indicators)
- Stage tracker (Building Profile → Discovery → Shortlisting → Application)
- AI-powered to-do list with next steps

### 5. **AI Counsellor (CORE FEATURE)**
Intelligent counseling agent that understands:
- Your complete profile
- Current stage in the process
- Shortlisted and locked universities

**Capabilities:**
- ✅ Explains profile strengths and gaps
- ✅ Recommends universities (Dream/Target/Safe)
- ✅ Provides acceptance likelihood analysis
- ✅ **Takes actions**: Shortlists universities, locks choices, creates tasks
- ✅ Suggests next steps based on current stage
- ✅ Available via chat interface (voice interface ready but optional)

**Revolutionary Feature: Function Calling**
The AI doesn't just respond - it executes actions:
- Adds universities to your shortlist
- Creates tasks in your to-do list
- Locks university choices
- All actions persist to database with confirmation messages

### 6. **University Discovery**
Browse and explore universities with intelligent matching:

**Features:**
- Dream/Target/Safe categorization based on your profile
- Advanced filters: Country, category, search
- Detailed university cards showing:
  - Match score and reasoning
  - Location and ranking
  - Tuition fees
  - Acceptance rate (color-coded)
  - Scholarship availability
- Shortlist functionality (heart icon)
- Lock mechanism (lock icon)
- Tabs for easy navigation

**Matching Algorithm:**
- Profile strength calculation
- Acceptance likelihood scoring
- Risk assessment
- Budget compatibility check
- Country preference matching

### 7. **Application Guidance**
Unlocked after locking a university:

**Features:**
- Overall progress tracker with percentage
- Personalized task list with:
  - Priority badges (high/medium/low)
  - Category tags (SOP/Exam/Application)
  - Due dates
  - Completion tracking
- Visual progress bar
- One-click task completion toggle

### 8. **Profile Management**
- Fully editable profile
- Real-time recalculation of:
  - University recommendations
  - Profile strength
  - Acceptance chances
  - Task priorities

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js
- **API Routes**: Next.js API Routes
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma

### AI Integration
- **Primary AI**: Groq (Llama 3.3 70B Versatile) with function calling
- **Onboarding AI**: Groq (Mixtral-8x7b-32768)
- **Backup AI**: Google Gemini 2.0 Flash

### Database Schema
- User authentication (User, Account, Session)
- UserProfile (onboarding data)
- University (37 seeded universities)
- ShortlistedUniversity
- LockedUniversity
- Task

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (or Neon account)
- Groq API key
- Google OAuth credentials (optional)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-counsellor
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI APIs
GROQ_API_KEY="your-groq-api-key"
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database with universities
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 🗄️ Database Seeding

The application comes with 37 pre-seeded universities across 5 countries:

- **USA**: MIT, Stanford, Harvard, UC Berkeley, UCLA, etc.
- **UK**: Oxford, Cambridge, Imperial College, UCL, Edinburgh
- **Canada**: University of Toronto, UBC, McGill, Waterloo
- **Australia**: ANU, University of Melbourne, UNSW, Sydney
- **Germany**: TU Munich, Heidelberg, LMU Munich

Each university includes:
- Category (Dream/Target/Safe)
- Tuition fees
- Acceptance rates
- Rankings
- Scholarship information
- Requirements

---

## 📁 Project Structure

```
ai-counsellor/
├── app/
│   ├── (protected)/          # Protected routes requiring auth
│   │   ├── dashboard/        # Main dashboard
│   │   ├── universities/     # University discovery
│   │   ├── guidance/         # Application guidance
│   │   ├── counsellor/       # AI chat
│   │   ├── onboarding/       # Dual onboarding system
│   │   └── profile/          # Profile management
│   ├── api/                  # API routes
│   │   ├── chat/             # AI counsellor with function calling
│   │   ├── onboarding-chat/  # AI-led onboarding
│   │   ├── universities/     # University endpoints
│   │   ├── tasks/            # Task management
│   │   ├── shortlist/        # Shortlist management
│   │   └── locked-universities/
│   ├── actions/              # Server actions
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── ...                   # Custom components
├── lib/
│   ├── university-matcher.ts # Matching algorithm
│   ├── task-generator.ts     # Task generation logic
│   ├── db.ts                 # Prisma client
│   └── ...
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Database seeding script
└── public/                   # Static assets
```

---

## 🎯 User Flow

### Step-by-Step Journey

1. **Landing Page**
   - User sees value proposition
   - Clicks "Get Started"

2. **Signup/Login**
   - Creates account (email or Google)
   - Automatic redirect to onboarding

3. **Onboarding** (Choose one mode)
   - **Manual**: 4-step form
   - **AI-Led**: Conversational data collection

4. **Dashboard**
   - View profile summary
   - See profile strength analysis
   - Check current stage
   - View next steps

5. **AI Counsellor Chat**
   - Ask for recommendations
   - Get personalized advice
   - **AI shortlists universities for you**
   - Get strategic guidance

6. **University Discovery**
   - Browse by Dream/Target/Safe
   - Filter by country/category
   - Shortlist favorites
   - Lock final choice

7. **Application Guidance** (After locking)
   - View personalized timeline
   - Complete tasks one by one
   - Track progress
   - Prepare application materials

---

## 🤖 AI Function Calling

### How It Works

The AI Counsellor uses Groq's function calling feature to take real actions:

**Available Functions:**
1. `shortlist_university` - Adds university to user's shortlist
2. `lock_university` - Commits to a university choice
3. `unlock_university` - Removes university lock
4. `create_task` - Adds task to user's to-do list
5. `mark_task_complete` - Marks task as done

**Example Conversation:**
```
User: "I'm interested in MIT and Stanford, can you save them?"
AI: "Great choices! Let me add those to your shortlist..."
[AI calls shortlist_university(MIT)]
[AI calls shortlist_university(Stanford)]
System: "🤖 ✓ Added MIT to your shortlist!"
System: "🤖 ✓ Added Stanford to your shortlist!"
```

---

## 🧮 University Matching Algorithm

### Profile Strength Calculation
- **Academics** (GPA, education level)
- **Exams** (TOEFL/IELTS, GRE/GMAT status)
- **SOP** (Statement of Purpose progress)

### Match Scoring
Considers:
- Profile strength vs university requirements
- Budget compatibility
- Country preferences
- Field of study alignment
- Competition level
- Acceptance rates

### Categorization
- **Dream**: Reach schools (lower acceptance likelihood)
- **Target**: Good fit schools (moderate acceptance likelihood)
- **Safe**: Safety schools (higher acceptance likelihood)

---

## 📝 Task Generation

Tasks are automatically generated based on:
- Current profile stage
- Missing profile components
- Exam status
- SOP progress
- Locked university requirements

**Example Tasks:**
- "Register for TOEFL exam"
- "Draft SOP introduction"
- "Collect recommendation letters"
- "Prepare financial documents"

---

## 🎨 UI/UX Highlights

- Clean, intuitive, modern design
- Responsive for all screen sizes
- Smooth animations and transitions
- Color-coded visual feedback
- Progress indicators throughout
- Empty states with helpful CTAs
- Accessible components

---

## 🔐 Security

- Secure authentication with NextAuth
- Protected API routes
- Database-level user isolation
- Environment variable protection
- SQL injection prevention (Prisma ORM)

---

## 📊 Key Metrics

- **37 Universities** across 5 countries
- **3 Categorization levels** (Dream/Target/Safe)
- **4 Onboarding steps** in manual mode
- **3 Profile strength dimensions** (Academics/Exams/SOP)
- **4 Application stages** tracked
- **5 AI function tools** available

---

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables Required for Production
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `GROQ_API_KEY`
- `GOOGLE_CLIENT_ID` (if using OAuth)
- `GOOGLE_CLIENT_SECRET` (if using OAuth)

---

## 🎬 Demo Flow Suggestion

1. **Landing Page** - Show clean design
2. **Signup** - Quick registration
3. **AI Onboarding** - Demonstrate conversational flow
4. **Dashboard** - Show profile strength visualization
5. **AI Chat** - Ask for recommendations, watch AI take actions
6. **Universities** - Browse and shortlist
7. **Lock University** - Commit to choice
8. **Guidance** - View generated tasks and timeline

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Signup flow
- [ ] Login flow
- [ ] Google OAuth
- [ ] Manual onboarding
- [ ] AI-led onboarding
- [ ] Dashboard loads correctly
- [ ] AI chat responds
- [ ] AI function calling works
- [ ] University discovery page
- [ ] Shortlist functionality
- [ ] Lock mechanism
- [ ] Guidance page
- [ ] Task completion toggle
- [ ] Profile editing

---

## 🐛 Known Issues

- **Prisma Type Errors**: TypeScript shows errors but runtime works fine. Run `npx prisma generate` after stopping dev server to fix.

---

## 🤝 Contributing

This is a hackathon project. For improvements or suggestions, please reach out to the team.

---

## 📄 License

This project is built for educational and demonstration purposes.

---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **shadcn/ui** - Beautiful UI components
- **Groq** - Fast AI inference
- **Neon** - Serverless PostgreSQL
- **Vercel** - Deployment platform

---

## 📞 Support

For questions or issues, please contact the development team.

---

**Built with ❤️ for students pursuing their study abroad dreams**

🎓 Good luck with your applications!
