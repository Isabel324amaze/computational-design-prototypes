# Camera Obscura

A deterministic learning tool for pinhole-camera geometry. Explore object distance, object height and camera depth; observe the inverted ground-glass image and the relationship `image height = object height × camera depth / object distance`.

## Run

Use Node 24 and pnpm 11.25.0. Run `pnpm install`, `pnpm dev`, `pnpm lint` and `pnpm build`. No API key is needed.

## Deploy

In Vercel Hobby import the repository with Root Directory `camera-obscura`. The checked-in Vite configuration builds `dist`. Validation presets should produce 0.250 m and 0.125 m respectively. Test reset, sliders, navigation and narrow-screen layout on the published URL.
