# Xtock

AI-powered demand forecasting and purchase order management for restaurants.

## Overview

Xtock is a mobile-first web application that helps produce businesses optimize their purchasing decisions through intelligent demand forecasting. By analyzing historical sales data and incorporating weather patterns, Xtock generates accurate purchase predictions and automates supplier communication via WhatsApp.

### Key Features

- **AI-Powered Forecasting**: 1-day demand predictions based on historical sales data with weather-based adjustments
- **Smart Data Import**: CSV file upload with validation or direct Toast POS integration
- **Automated Purchase Orders**: Generate and manage purchase orders from forecasts
- **WhatsApp Integration**: Send formatted forecasts to suppliers via WhatsApp (Twilio)
- **Real-time Analytics**: Track savings, forecast accuracy, and sales trends
- **Mobile-First Design**: Optimized interface with bottom navigation for on-the-go management

## Tech Stack

### Frontend
- **React 18.3** with **TypeScript 5.6**
- **Vite** for build tooling and development
- **Tailwind CSS** with custom theme system (dark/light mode)
- **shadcn/ui** components built on Radix UI
- **React Query** for server state management
- **Wouter** for lightweight routing

### Backend
- **Node.js** with **Express 4.21**
- **PostgreSQL** with **Drizzle ORM** for type-safe database access
- **Neon Serverless** for database hosting
- **Express Sessions** with PostgreSQL store
- **Multer** for file uploads

### Integrations
- **Twilio** for WhatsApp messaging
- **OpenAI API** for AI-powered forecasting
- **Toast POS** for direct point-of-sale data integration

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Neon serverless account)
- Twilio account with WhatsApp Business API
- OpenAI API key (optional, for AI features)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_CONTENT_SID=your-twilio-template-sid
TWILIO_MESSAGING_SERVICE_SID=your-twilio-messaging-service-sid
TWILIO_FROM_NUMBER=your-twilio-business-number

# Toast POS (optional)
TOAST_CLIENT_ID=your-toast-client-id
TOAST_CLIENT_SECRET=your-toast-client-secret

# Development (optional)
USE_DUMMY_DATA=true  # Use test data instead of real database
```

### Installation

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Build

```bash
# Build client and server
npm run build

# Start production server
npm start
```

## Project Structure

```
XtockLite/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Route pages (Dashboard, Orders, Analytics, etc.)
│   │   ├── components/    # React components and shadcn/ui components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── contexts/      # React context providers
│   │   └── lib/           # Utilities and configurations
│
├── server/                 # Backend Node.js/Express application
│   ├── routes/            # API endpoints
│   ├── storage/           # Database abstraction layer
│   ├── forecasting.ts     # Forecasting algorithm
│   └── twilio-service.ts  # WhatsApp integration
│
├── shared/                 # Shared TypeScript types and schemas
│   └── schema.ts          # Drizzle ORM schema & Zod validators
│
└── migrations/             # Database migration files
```

## CSV Data Format

To upload sales data via CSV, your file must include the following columns. The system is flexible with column names and will automatically detect common variations.

### Required Columns

1. **Date** - Sale date/timestamp
   - Acceptable headers: `date`, `timestamp`, or any header containing these words
   - Format: Any valid date format (e.g., `2025-01-15`, `01/15/2025`, `2025-01-15T10:30:00`)

2. **Item** - Product/item name
   - Acceptable headers: `item`, `product`, `category`, `name`, or anything ending in `name`
   - Format: Any non-empty string

3. **Quantity** - Number of items sold
   - Acceptable headers: `quantity`, `qty`, or any header containing these words
   - Format: Positive integer (currency symbols, commas, and spaces are automatically stripped)

### Optional Columns

4. **Unit** (defaults to "units" if not provided)
   - Acceptable headers: `unit`, `uom`, or any header containing these words
   - Examples: `lbs`, `kg`, `boxes`, `cases`, `each`

5. **Price** (defaults to $1.00 if not provided)
   - Acceptable headers: `price`, `cost`, `amount`
   - Format: Numeric value (currency symbols and commas automatically stripped)

6. **Supplier** (optional)
   - Acceptable headers: `supplier`, `vendor`
   - Format: String

7. **Category** (optional)
   - Acceptable headers: `category`, `type`
   - Format: String

### Example CSV

```csv
date,item,quantity,unit,price,supplier,category
2025-01-15,Tomatoes,50,lbs,2.50,Fresh Farm Co,Vegetables
2025-01-15,Lettuce,30,heads,1.75,Fresh Farm Co,Vegetables
2025-01-16,Chicken Breast,100,lbs,4.50,Poultry Plus,Meat
2025-01-16,Salmon Fillet,25,lbs,8.99,Ocean Fresh,Seafood
```

### File Requirements

- **File size limit**: 10MB maximum
- **File type**: `.csv` files only
- **Encoding**: UTF-8 recommended
- Empty rows are automatically skipped
- Headers are case-insensitive and whitespace is trimmed

### Validation

The system performs automatic validation and will:
- Strip currency symbols ($, £, €, ¥) and commas from numeric values
- Convert prices to cents for storage (e.g., $12.50 → 1250 cents)
- Verify quantity is a positive whole number
- Ensure dates are valid and parsable
- Provide detailed error messages for invalid rows with row numbers

## Core Features

### Data Import

- **CSV Upload**: Drag-and-drop interface for historical sales data with flexible column detection
- **Toast POS Integration**: Direct connection to Toast point-of-sale system
- **Data Validation**: Real-time validation with detailed error reporting

### Demand Forecasting

- Predicts next-day demand for each item using historical data (last 30 days)
- Weather-based adjustments (sunny/cloudy/rainy conditions)
- Confidence metrics and savings calculations
- Requires minimum 3 days of data for accuracy

### Purchase Order Management

- Auto-generated purchase orders from forecasts
- Order workflow: draft → approved → sent → confirmed → delivered
- Supplier tracking with response time monitoring
- WhatsApp delivery with formatted message templates

### Analytics Dashboard

- 30-day performance metrics
- Sales trends and visualizations
- Cost savings indicators
- Forecast accuracy tracking

## API Endpoints

### Sales Data
- `POST /api/upload-csv` - Upload and validate CSV sales data
- `GET /api/sales-data` - Retrieve sales data with filtering

### Forecasting
- `POST /api/forecasts/generate-1day` - Generate 1-day forecast
- `GET /api/forecasts` - Retrieve existing forecasts

### Purchase Orders
- `GET /api/orders` - List purchase orders
- `POST /api/orders` - Create new purchase order
- `PATCH /api/orders/:id` - Update order status

### Messaging
- `POST /api/messaging/send` - Send WhatsApp message to supplier
- `POST /api/messaging/webhook` - Receive incoming WhatsApp messages

### Toast POS
- `POST /api/toast/auth` - Authenticate with Toast POS
- `GET /api/toast/sales` - Fetch sales data from Toast

## Database Schema

The application uses PostgreSQL with the following main tables:

- **sales_data**: Historical sales records with item, quantity, price, and supplier information
- **forecasts**: AI-generated demand predictions with confidence scores
- **purchase_orders**: Generated orders with status tracking and supplier details
- **suppliers**: Supplier contact information and performance metrics

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run dev:debug` - Development mode with Node debugger
- `npm run build` - Build production bundle
- `npm run start` - Run production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push Drizzle schema to database

### Type Safety

The project uses TypeScript throughout with:
- Shared types between client and server
- Drizzle ORM for database type safety
- Zod schemas for runtime validation
- Path aliases (`@/*` for client, `@shared/*` for shared code)

## Deployment

### Vercel (Recommended)

The application is configured for Vercel deployment with `vercel.json`:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

A `docker-compose.yml` is included for local PostgreSQL setup:

```bash
docker-compose up -d
```

## Documentation

Additional documentation available in:
- `/docs/ai_workflow.md` - AI workflow and forecasting details
- `/design_guidelines.md` - UI/UX design specifications
- `/replit.md` - Comprehensive project overview

## License

MIT

## Support

For issues and feature requests, please open an issue on the project repository.
