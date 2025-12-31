# Supabase Migrations

This folder contains SQL migrations for the database schema.

## How to Run Migrations

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to **SQL Editor** in the left sidebar
4. Open the migration file you want to run (from `/supabase/migrations/`)
5. Copy and paste the SQL into the editor
6. Click **Run** to execute the migration

## Migrations

### 001_create_property_links_table.sql

Creates the `property_links` table for storing shared property listings with:
- Basic property link data (url, title, description, image)
- Property-specific metadata (price, bedrooms, area, etc.) stored as JSONB
- Location coordinates (latitude, longitude)
- User tracking (shared_by, shared_at)
- Row Level Security (RLS) policies:
  - Anyone can read property links (no auth required)
  - Authenticated users can create, update, and delete their own links

## Table Schema

### property_links

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key |
| url | TEXT | Property listing URL |
| title | TEXT | Property title (from OG tags) |
| description | TEXT | Property description (from OG tags) |
| image | TEXT | Property image URL (from OG tags) |
| shared_by | TEXT | Email of user who shared the link |
| shared_at | TIMESTAMPTZ | When the link was shared |
| latitude | DOUBLE PRECISION | Property latitude |
| longitude | DOUBLE PRECISION | Property longitude |
| property_data | JSONB | Property-specific metadata (price, bedrooms, area, etc.) |
| created_at | TIMESTAMPTZ | Record creation timestamp |
| updated_at | TIMESTAMPTZ | Record update timestamp |

## Property Data Structure (JSONB)

The `property_data` column stores property-specific metadata as JSONB:

```json
{
  "price": 5000000,
  "currency": "SEK",
  "bedrooms": 3,
  "bathrooms": 2,
  "area": 85,
  "areaUnit": "m²",
  "propertyType": "Apartment",
  "address": "Example Street 123",
  "city": "Stockholm",
  "energyClass": "B",
  "builtYear": 2015,
  "floor": "2/5",
  "monthlyFee": 4500
}
```

## Security

The table uses Row Level Security (RLS) with the following policies:
- **Public Read**: Anyone can view property links (no authentication required)
- **Authenticated Write**: Only authenticated users can create property links
- **Owner Control**: Users can only modify/delete their own property links
