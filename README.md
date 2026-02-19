# Car Lifetime Cost Comparator

An interactive web application that compares the total cost of car ownership across 5 different buy/replace strategies over a configurable time horizon (up to 40 years).

## Purpose

Help users make informed decisions about vehicle purchasing strategies by modeling the full lifecycle cost including purchase price, financing, depreciation/resale, insurance, maintenance, fuel, and inflation — all with adjustable parameters.

## Five Scenarios Compared

| # | Strategy | Description |
|---|----------|-------------|
| 1 | **New Every 4 Years** | Buy new at MSRP, trade in after 4 years, repeat |
| 2 | **New Every 10 Years** | Buy new at MSRP, trade in after 10 years, repeat |
| 3 | **New — Keep Forever** | Buy one new car, maintain it for the entire time horizon |
| 4 | **Cheap Used Every 10 Years** | Buy a ~8-10 year old car, drive 10 years, replace with another cheap used |
| 5 | **4-Year Used Every 10 Years** | Buy a 4-year-old car, drive 10 years, replace with another 4-year-old |

## Key Features

- Side-by-side cumulative and annual cost comparison charts
- Cash vs. financed payment mode toggle
- Full parameter control via slider inputs across three categories: Purchase & Resale, Operating Costs, Finance & Economy
- Summary cards ranked by total cost with show/hide toggle per scenario
- Inflation-adjusted pricing throughout
- Age-dependent maintenance, insurance, and fuel efficiency modeling

## Documentation

- [Product Requirements Document](specs/PRD.md)
- [Technical Specification](specs/TECHNICAL.md)
- [Calculation Engine Specification](specs/CALCULATIONS.md)
- [UI/UX Specification](specs/UI_UX.md)
- [Data Model & Parameters](specs/DATA_MODEL.md)

## Development

See [specs/TECHNICAL.md](specs/TECHNICAL.md) for stack, architecture, and build instructions.

## Origin

This project was designed through an iterative conversation exploring the question: "What is the true cost of owning a car over 40 years under different replacement strategies?" The specification documents capture the full design intent from that conversation.
# Car Lifetime Cost Comparator (Rust/WASM + React)

This project calculates the long-term financial cost of different car ownership strategies using a high-performance **Rust/WASM** engine integrated into a **React** application.

## 1. Architecture
- **Engine**: Core financial logic implemented in Rust (`src/engine.rs`), compiled to WebAssembly.
- **Frontend**: React application (Vite) that interacts with the WASM engine via `vite-plugin-wasm`.
- **Glue**: `wasm-bindgen` handles the data transfer between JS and Rust.

## 2. Prerequisites
- **Rust & Cargo**: `rustc --version`
- **Node.js**: `node --version`
- **wasm-pack**: `wasm-pack --version` (for building the Rust engine)

## 3. Setup & Installation

### A. Build the WASM Engine
First, compile the Rust code to WebAssembly:

```bash
wasm-pack build --target web
```
*Note: If you encounter version errors, ensure `wasm-bindgen` in `Cargo.toml` matches your toolchain (currently pinned to `=0.2.92`).*

### B. Install Frontend Dependencies
```bash
npm install
```

## 4. Running the Application
Start the Vite development server:

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (usually [http://localhost:5173](http://localhost:5173)).

## 5. Development Workflow
- **Modify Logic**: Edit `src/engine.rs`. You must re-run `wasm-pack build --target web` to see changes.
- **Modify UI**: Edit `src/App.jsx` or components. Vite HMR updates these instantly.

## 6. Building for Production
To create a production-ready bundle:

```bash
npm run build
```
The output will be in the `dist/` directory.
