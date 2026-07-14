# KoboWise Local Product Images

Place your local product image files in this directory (e.g. `rice.jpg`, `indomie.jpg`, etc.).

Once you have added a file here, you can reference it inside your `src/supabase.ts` mock database like this:

```typescript
image_url: '/images/rice.jpg'
```

### Tips:
- Use clear, high-quality square or landscape images.
- Keep file sizes under 200KB for fast loading times.
- After updating `src/supabase.ts` with new paths, clear your browser's localStorage or do a hard refresh so the database re-seeds with the new values.
