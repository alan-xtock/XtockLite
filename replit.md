# XtockLite - AI Produce Ordering System

## Overview

XtockLite is a mobile-first web application that uses AI to optimize produce purchasing decisions for businesses. The system analyzes sales data to generate forecasts and automate purchase order creation, aiming to reduce daily produce costs by 10%. Key features include CSV data upload, AI-powered demand forecasting, automated purchase order generation, and WhatsApp integration for order delivery to suppliers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based development
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, mobile-first UI design
- **State Management**: React Query (@tanstack/react-query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Dark/light mode support with CSS custom properties and automatic system preference detection

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Processing**: Multer for CSV file uploads with Papa Parse for data parsing
- **AI Integration**: OpenAI GPT-5 for demand forecasting and purchase optimization
- **Data Validation**: Zod schemas for runtime type checking and validation

### Data Storage Solutions
- **Primary Database**: PostgreSQL configured through Drizzle with Neon Database serverless connection
- **Schema Design**: 
  - Sales data tracking with price precision (cents storage)
  - AI forecast results with confidence metrics
  - Purchase orders with status workflow management
  - Supplier information and response time tracking
- **Development Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Security**: Basic session-based authentication without complex user management

### Mobile-First Design System
- **Design Language**: Reference-based approach inspired by Notion and Linear
- **Color Palette**: Dark blue primary (#1e3a8a) with green accents (#059669) for success indicators
- **Typography**: Inter font family via Google Fonts
- **Layout**: Bottom navigation with 4 main sections (Dashboard, Orders, Analytics, Settings)

## External Dependencies

### AI Services
- **OpenAI API**: GPT-5 model for sales data analysis and demand forecasting
- **Integration**: Direct API calls for generating purchase recommendations and cost optimization insights

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production data storage
- **Connection**: @neondatabase/serverless for optimized serverless database connections

### Communication Services
- **WhatsApp Integration**: Planned integration for sending purchase orders to suppliers (implementation pending)

### Development Tools
- **Vite**: Build tool and development server with React plugin
- **Replit Integration**: Cartographer plugin for development environment integration
- **TypeScript**: Full TypeScript support across client, server, and shared code

### UI Components
- **Radix UI**: Headless component library for accessible UI primitives
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework with custom design system

### File Processing
- **CSV Handling**: Papa Parse for robust CSV parsing with error handling
- **File Upload**: Multer middleware for multipart form data processing

### Data Validation
- **Runtime Validation**: Zod for schema validation across API boundaries
- **Type Safety**: Drizzle Zod integration for database schema validation