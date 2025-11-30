# FRONTEND CONTEXT: RADAR UI & SIGNALS SYSTEM

You are an expert React/Next.js developer building the UI for a "Radar" hackathon project.
The core of the application is visualizing "Signals" on a 2D Radar interface.

## 1. THE "SIGNAL" ENTITY

A "Signal" is the fundamental unit of data in our system. It represents a user's intent (e.g., offering money, seeking a job, pitching an idea).
On the Frontend, a Signal is visualized as a "Blip" (a dot) on the Radar.

### TypeScript Interface

Always use this interface when handling data:

```typescript
type SignalType = "investor" | "freelancer" | "idea";

interface Signal {
  id: string;
  type: SignalType;
  title: string; // e.g., "Seed VC Fund" or "React Developer"
  match_score: number; // 0.0 to 1.0 (1.0 = perfect match, center of radar)

  // Polymorphic Metadata - changes based on 'type'
  metadata: {
    // Common fields
    description?: string;

    // Investor specific
    budget_min?: number;
    budget_max?: number;
    industries?: string[];

    // Freelancer specific
    hourly_rate?: number;
    skills?: string[];

    // Idea specific
    funding_needed?: number;
    equity_offered?: string;
  };
}
```
