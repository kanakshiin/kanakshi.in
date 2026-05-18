# ecommerce-frontend

This folder contains the new Next.js App Router storefront intended for Vercel deployment.

## Quick start

1. `npm install`
2. Copy `.env.example` to `.env.local`
3. Set `NEXT_PUBLIC_API_BASE_URL` to the Laravel API URL
4. Run `npm run dev`

## Expected backend endpoints

- `/api/v1/settings/public`
- `/api/v1/catalog/categories`
- `/api/v1/catalog/products`
- `/api/v1/catalog/products/{slug}`

## Suggested Vercel env vars

- `NEXT_PUBLIC_API_BASE_URL`
- `NEXT_PUBLIC_BACKEND_SITE_URL`
