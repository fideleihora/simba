# Simba Supermarket Online - Project Overview

This is a modern, responsive e-commerce web application for **Simba Supermarket**, Rwanda's online supermarket. It is built using React, TypeScript, and Vite, focusing on a clean user experience for browsing and purchasing products.

## 🚀 Tech Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **State Management:** React Context API (for Shopping Cart)
- **Icons:** Lucide React
- **Styling:** Vanilla CSS (component-based)

## 📁 Project Structure

- `src/components/`: UI components (Navbar, Hero, ProductGrid, CartDrawer, etc.) with associated CSS files.
- `src/context/`: State management for the shopping cart (`CartContext.tsx`).
- `src/hooks/`: Custom hooks for logic separation (e.g., `useProducts.ts` for filtering and search).
- `src/data/`: Static product data and store configuration in `simba_products.json`.
- `src/types.ts`: Centralized TypeScript interface definitions.
- `public/assets/`: Static assets like the SIMBA logo.

## 🛠️ Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Starts the Vite development server. |
| `npm run build` | Runs TypeScript compiler and builds the project for production. |
| `npm run preview` | Locally previews the production build. |

## 💡 Development Conventions

- **State Persistence:** The shopping cart is automatically persisted to `localStorage` via `CartContext`.
- **Product Filtering:** Product searching and category filtering are handled by the `useProducts` hook, which performs client-side filtering on the local JSON data.
- **Styling:** Each component has its own dedicated `.css` file in the same directory (e.g., `ProductCard.tsx` and `ProductCard.css`).
- **Typing:** Strict TypeScript interfaces are used for all data structures (Products, Store, CartItems).

## 🛒 Core Features

1. **Product Browsing:** Displaying products in a responsive grid.
2. **Search & Filter:** Real-time search by name or category and category-based filtering.
3. **Cart Management:** Add/remove items, update quantities, and clear the cart.
4. **Responsive Design:** Mobile-friendly UI with a slide-out cart drawer.
