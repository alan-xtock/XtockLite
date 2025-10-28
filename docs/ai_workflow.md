Agile AI Development Workflow

This document outlines a flexible workflow for using an AI to build components. It's designed for rapid iteration and avoids documentation "drift" by separating active build specs from general component documentation.

This approach is based on your idea of a "scratchpad" for new builds and a "general" document for completed work.

Recommended Project Structure

We'll create a single top-level folder (e.g., ai-dev/) to hold all our AI-related specs and documentation. This keeps your src/ directory clean.

/ (your-project-root)
│
├── src/
│   ├── components/
│   │   ├── HeroSection.jsx
│   │   ├── TestimonialSection.jsx
│   │   └── ... (all your components)
│   └── ...
│
└── ai-dev/
    │
    ├── component_docs.md     <-- Your "general documentation" for built components
    │
    └── build_scratchpad.md   <-- Your "scratchpad" for detailing new components


How to Use This Structure

1. ai-dev/build_scratchpad.md (For NEW Components)

This is your primary "active" file.

What it is: A temporary, disposable file for you to write detailed specs for new components that need to be built.

Workflow:

When you want a new component (like the "Testimonial Section"), you'll write a detailed spec for it inside this file.

You'll give the AI this file (and any screenshots) and ask it to generate the component code.

The AI will generate the code (e.g., src/components/TestimonialSection.jsx).

Once the component is built and working, you can delete the spec from this file. This keeps it clean and ready for the next task.

2. ai-dev/1_component_docs.md (For EXISTING Components)

This is your "living documentation" file.

What it is: A high-level overview of the components you've already built and stabilized.

Workflow:

After a component is built (e.g., TestimonialSection.jsx) and you're happy with it, you add a short, high-level entry for it here.

You don't copy the whole spec, just the "general intent and structure" as you said.

Example Content for 1_component_docs.md:

# Component Documentation

## HeroSection
* **Purpose:** The main "hero" for the landing page.
* **Props:** `title` (string), `subtitle` (string), `imageUrl` (string).
* **Location:** `src/components/HeroSection.jsx`

## TestimonialSection
* **Purpose:** Displays a 2-column grid of customer testimonials.
* **Props:** `testimonials` (array of objects: `{ quote, name, role }`).
* **Location:** `src/components/TestimonialSection.jsx`


Why This Workflow is Better for You

No "Double Workload": You only write the detailed spec once in the scratchpad, and it's disposable.

Prevents Stale Docs: The "living docs" (1_component_docs.md) are high-level, so they are much less likely to become outdated than a full spec.

Clean Project: Your src/ folder contains only code, just as it should.