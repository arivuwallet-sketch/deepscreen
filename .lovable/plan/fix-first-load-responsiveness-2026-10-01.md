# Fix first-load responsiveness

## Changes
- Replace delayed mobile detection with a hydration-safe viewport subscription so phone layouts update immediately without requiring refreshes.
- Strengthen the first-paint responsive rules for the shared header and landing page to prevent wide desktop sizing from flashing on narrow screens.
- Keep all existing navigation and page behavior unchanged.

## Verification
- Check the TypeScript error is gone.
- Compare cold load and refresh at phone and desktop widths, including horizontal overflow and header/menu layout.
- Confirm the preview build remains clean.

## Technical details
- Use React's `useSyncExternalStore` with `matchMedia` instead of setting viewport state only after an effect.
- Keep server rendering deterministic, with CSS media queries defining the correct first paint before hydration.
