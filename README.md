# AI Counsellor - Your Study Abroad Guide

**Live Demo:** [https://ai-counsellor-wine.vercel.app/](https://ai-counsellor-wine.vercel.app/)

An AI-powered platform that helps students navigate their study abroad journey with personalized university recommendations, automated task management, and intelligent guidance.

---

## Features

### 🤖 AI Counselor
- Intelligent chat assistant with full context of your profile
- **Function calling**: AI takes real actions (shortlists universities, creates tasks, locks choices)
- Personalized recommendations based on your academic background and goals

### 🎓 Smart University Matching
- **37+ universities** across USA, UK, Canada, Australia, and Germany
- Categorized as Dream/Target/Safe based on your profile
- Advanced filtering by country, category, and search
- Match scoring with acceptance likelihood analysis

### 📊 Profile Analysis
- Comprehensive profile strength calculation
- Tracks academics, exam readiness, and SOP progress
- Real-time recommendations for improvement

### ✅ Application Guidance
- Automated task generation based on your stage
- Personalized to-do lists with priority levels
- Progress tracking from profile building to application submission

### 🎯 Dual Onboarding
- **Manual Mode**: 4-step guided form
- **AI Mode**: Conversational data collection
- Both modes collect academic background, study goals, budget, and test readiness

---

## Tech Stack

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components

**Backend**
- Next.js API Routes
- NextAuth.js (authentication)
- PostgreSQL (Neon)
- Prisma ORM

**AI**
- Groq (Llama 3.3 70B + 8B Instant fallback)
- Function calling for action execution
- Streaming responses

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Groq API key

### Installation

```bash
# Clone repository
git clone <repository-url>
cd ai-counsellor

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Add your credentials to .env

# Setup database
npx prisma generate
npx prisma migrate dev
npm run seed

# Run development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY="your-groq-key"
GOOGLE_CLIENT_ID="your-google-id"  # Optional
GOOGLE_CLIENT_SECRET="your-google-secret"  # Optional
```

---

## User Flow

1. **Sign up** with email or Google
2. **Complete onboarding** (manual form or AI chat)
3. **View dashboard** with profile strength and next steps
4. **Chat with AI counselor** for personalized advice
5. **Discover universities** filtered by your preferences
6. **Lock a university** to unlock application guidance
7. **Complete tasks** and track your application progress

---

## Key Features Explained

### AI Function Calling
The AI doesn't just chat - it executes actions:
- Adds universities to your shortlist
- Creates tasks in your to-do list
- Locks university choices
- All with database persistence

**Example:**
```
User: "Add MIT and Stanford to my list"
AI: "I'll shortlist both for you!"
✅ MIT added to shortlist
✅ Stanford added to shortlist
```

### University Matching Algorithm
Considers:
- Your GPA and academic background
- Budget constraints
- Country preferences
- Exam scores
- Profile strength vs university requirements

### Task Generation
Automatically creates tasks based on:
- Current application stage
- Missing profile components
- Locked universities
- Exam and SOP status

---

## Deployment

Deployed on **Vercel** with Neon PostgreSQL.

**Production URL:** [https://ai-counsellor-wine.vercel.app/](https://ai-counsellor-wine.vercel.app/)

---

## Project Structure

```
ai-counsellor/
├── app/
│   ├── (protected)/         # Auth-required pages
│   │   ├── dashboard/
│   │   ├── universities/
│   │   ├── counsellor/
│   │   ├── guidance/
│   │   └── profile/
│   └── api/                 # API routes
├── components/              # React components
├── lib/                     # Utilities and algorithms
└── prisma/                  # Database schema and seed
```

---

## License

Built for educational purposes.

---

**Built with ❤️ for students pursuing their study abroad dreams**

🎓 Good luck with your applications!
