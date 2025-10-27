# Potential.com - AI Agents Website

## Overview

This is a modern full-stack web application for Potential.com, an AI agents platform that helps businesses deploy intelligent automation tools. The application is built with React/TypeScript frontend, Express.js backend, and PostgreSQL database, designed to showcase AI solutions and facilitate customer onboarding.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state, React hooks for local state
- **Build Tool**: Vite for development and production builds
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database ORM**: Drizzle ORM with Neon PostgreSQL
- **Session Management**: PostgreSQL-backed sessions with express-session
- **Authentication**: Custom implementation with bcrypt password hashing
- **Email Service**: SendGrid for transactional emails
- **API Design**: RESTful endpoints with TypeScript validation

### Database Schema
- **Users**: Authentication and profile management
- **Newsletter Subscribers**: Email list management
- **Resource Downloads**: Download tracking
- **Vera Consultations**: AI consultation form submissions

## Key Components

### Authentication System
- User registration with email verification
- Session-based authentication with secure cookies
- Password reset functionality
- Profile management with optional fields

### AI Agent Forms
- **Chatbot Creation**: Dynamic form for AI chatbot configuration
- **Voice Agent Creation**: Voice AI agent setup with VAPI integration
- Real-time agent deployment and configuration

### Content Management
- **Blog Integration**: WordPress API proxy for multi-language content
- **SEO Management**: Dynamic meta tags with structured data
- **Resource Downloads**: PDF whitepaper downloads with tracking

### Marketing Features
- **Newsletter Subscription**: Integrated email list management
- **Partner Applications**: Multi-step partner onboarding
- **Analytics Integration**: Google Tag Manager for conversion tracking

## Data Flow

1. **User Registration**: Form submission → validation → database storage → email verification
2. **AI Agent Creation**: Form data → external API calls → agent deployment → user notification
3. **Content Delivery**: Route matching → database queries → template rendering → client response
4. **Blog Content**: API requests → WordPress proxy → language detection → content rendering

## External Dependencies

### Core Services
- **Neon Database**: PostgreSQL hosting with connection pooling
- **SendGrid**: Email delivery service for notifications
- **WordPress API**: Blog content management system
- **VAPI**: Voice AI agent infrastructure

### Development Tools
- **Replit**: Development environment and hosting
- **Drizzle Kit**: Database migration management
- **ESBuild**: Production build optimization

### Analytics & Monitoring
- **Google Tag Manager**: Conversion tracking and analytics
- **AOS**: Scroll-based animations library

## Deployment Strategy

### Production Environment
- **Platform**: Replit Autoscale deployment
- **Build Process**: Vite frontend build + ESBuild server bundle
- **Static Assets**: Served directly from Express with caching headers
- **Environment Variables**: Managed through Replit secrets

### Security Measures
- HTTPS enforcement with redirect middleware
- Security headers (HSTS, XSS protection, content type options)
- Session security with PostgreSQL store
- Input validation and sanitization
- CORS configuration for API endpoints

### Performance Optimizations
- Asset compression and caching
- Database connection pooling
- Query optimization with Drizzle ORM
- CDN integration for static assets

## Changelog
- October 27, 2025. Updated Demo page "What Ruby Can Do" section with beauty & cosmetics industry use cases focused on Alora Brands (Shopping, Booking Experts, Learning Courses, HR & Career, Customer Support, System Automation)
- October 27, 2025. Replaced integrations text with actual brand logos using react-icons (Shopify, Stripe, HubSpot, Salesforce, Mailchimp, Twilio, Slack, Zapier, Notion, AWS, Google Cloud)
- October 27, 2025. Created interactive AI Agent Demo page at /demo featuring Ruby with Chat, Voice, and Avatar interfaces, comprehensive use case showcases, and integrations display
- July 4, 2025. Added hyperlink functionality to footer logo linking to home page across all website pages
- July 4, 2025. Fixed AI agent images deployment issue with proper static file serving for production
- July 4, 2025. Added AI agent images to use case cards with proper design and hover effects
- June 17, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.