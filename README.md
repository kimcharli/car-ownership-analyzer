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
