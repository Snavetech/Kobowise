# KoboWise Product Customization Guide

You can customize all product names, descriptions, pricing, and Abraka pickup points in:  
📄 **[supabase.ts](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts)** (inside the `MOCK_PRODUCTS` array).

---

## Guide to Product Fields

For each product, you can customize the following fields:

```typescript
{
  id: 'prod-1',
  trader_id: 'trader-1',
  category_id: 'cat-1',
  name: '50kg Bag of Rice (Nigeria Long Grain)',          // <--- Change product name
  description: 'Clean stone-free local Nigerian rice...', // <--- Change description
  shares_per_person: '2.5 kg',                           // <--- Portions per buyer share
  total_price: 64000,                                    // <--- Total bulk price in Naira (₦)
  total_shares: 4,                                       // <--- Number of students to split it
  price_per_share: 16000,                                // <--- Cost per student (total_price / total_shares)
  stock_quantity: 12,                                    // <--- Available stock
  estimated_delivery: '1-2 Days',                         // <--- Delivery timeframe
  pickup_location: 'Abraka Main Market (Opposite DELSU Gate)', // <--- Pickup point in Abraka
  status: 'active',
  image_url: 'https://images.unsplash.com/...'           // <--- Image path (e.g. '/images/rice.jpg')
}
```

---

## Clickable Product Shortcuts

Click any link below to jump directly to the code for that product:

* **Food Staples & Groceries**
  * Rice: [prod-1 at L138](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L138)
  * Indomie: [prod-2 at L154](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L154)
  * Vegetable Oil: [prod-4 at L187](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L187)
  * Frozen Chicken: [prod-6 at L219](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L219)
  * Milo: [prod-8 at L251](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L251)
  * Coca-Cola: [prod-9 at L267](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L267)
  * Spaghetti: [prod-10 at L283](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L283)

* **Dairy & Breakfast**
  * Peak Milk: [prod-11 at L299](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L299)
  * Dano Milk: [prod-12 at L315](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L315)
  * Three Crowns: [prod-13 at L331](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L331)
  * Cabin Biscuits: [prod-14 at L347](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L347)
  * Chin Chin: [prod-15 at L363](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L363)
  * Corn Flakes: [prod-16 at L379](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L379)

* **Fresh Farm Produce (Abraka Local Markets)**
  * Tomatoes: [prod-17 at L395](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L395)
  * Potatoes: [prod-18 at L411](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L411)
  * Oranges: [prod-19 at L427](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L427)

* **Personal Care & Cleaning**
  * Dettol Soap: [prod-20 at L443](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L443)
  * Close Up Toothpaste: [prod-21 at L459](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L459)
  * Nivea Lotion: [prod-22 at L475](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L475)
  * Sunlight Detergent: [prod-23 at L491](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L491)
  * Hypo Bleach: [prod-24 at L507](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L507)

* **DELSU Student Materials & Gadgets**
  * Power Bank: [prod-3 at L170](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L170)
  * DELSU Notebooks: [prod-5 at L203](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L203)
  * DELSU Lanyard/ID Holder: [prod-7 at L235](file:///c:/Users/Ismail/Documents/Kobowise/src/supabase.ts#L235)

---

## 🔁 Applying Your Changes

Once you edit and save your changes in `supabase.ts`:

1. Open your web browser.
2. Press `F12` (or right-click and choose **Inspect**) to open Developer Tools.
3. Go to **Application** (or **Storage**) → **Local Storage** → Click on your site (`http://localhost:...`).
4. Right-click and choose **Clear** (or delete all keys starting with `kobowise_`).
5. Refresh the page (`Ctrl + F5`). The system will automatically parse your new names and descriptions from the seed file and load them!
