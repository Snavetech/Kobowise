# KoboWise EmailJS HTML Templates Guide

This directory contains email-safe, responsive, branded HTML templates ready to be pasted directly into your [EmailJS Dashboard](https://dashboard.emailjs.com/admin/templates).

---

## 1. 6-Digit OTP Email Verification
- **File**: [`otp-verification.html`](./otp-verification.html)
- **Subject in EmailJS**: `Your KoboWise Verification Code: {{otp_code}}`
- **Matching Environment Variable**: `VITE_EMAILJS_TEMPLATE_ID_OTP`
- **Dynamic Variables**:
  - `{{to_name}}` - Student's name (e.g., *Omologe Evans*)
  - `{{to_email}}` - Student's DELSU email address
  - `{{otp_code}}` - 6-digit numeric code (e.g., *738491*)
  - `{{expiry_minutes}}` - *10*
  - `{{platform}}` - *KoboWise Campus Marketplace*
  - `{{campus}}` - *Delta State University (DELSU), Abraka*

---

## 2. Trader Waitlist Confirmation & Welcome
- **File**: [`trader-waitlist.html`](./trader-waitlist.html)
- **Subject in EmailJS**: `Welcome to the KoboWise Campus Trader Waitlist! 🎉`
- **Matching Environment Variable**: `VITE_EMAILJS_TEMPLATE_ID_WAITLIST`
- **Dynamic Variables**:
  - `{{to_name}}` - Vendor / Trader full name
  - `{{to_email}}` - Trader email
  - `{{phone_number}}` - Phone / WhatsApp contact
  - `{{campus}}` - *Delta State University (DELSU)*

---

## 3. Order Confirmation & Escrow Receipt
- **File**: [`order-receipt.html`](./order-receipt.html)
- **Subject in EmailJS**: `KoboWise Escrow Receipt #{{order_id}} - Payment Secured`
- **Dynamic Variables**:
  - `{{to_name}}` - Buyer full name
  - `{{to_email}}` - Buyer email
  - `{{order_id}}` - Unique transaction reference (e.g., *KBW-91823*)
  - `{{product_name}}` - Name of product or bulk share
  - `{{shares_count}}` - Quantity of shares purchased
  - `{{total_price}}` - Formatted price (e.g., *₦3,500*)
  - `{{pickup_location}}` - Campus collection venue (e.g., *DELSU Site II Gate*)
  - `{{escrow_code}}` - 4-digit release PIN

---

## How to Apply These Templates in EmailJS

1. Go to [EmailJS Template Dashboard](https://dashboard.emailjs.com/admin/templates).
2. Click **Create New Template**.
3. In the content editor, switch the mode or click the **Source Code** / **HTML** tab (`</>`).
4. Copy and paste the contents of the `.html` file from this folder.
5. In the **Settings** tab:
   - Set the **To Email** field to: `{{to_email}}`
   - Set the **From Name** field to: `KoboWise Campus Marketplace`
   - Set the **Reply To** field to: `support@kobowise.com`
6. Click **Save** in the top right.
7. Copy the generated `template_xxxxxxx` ID and paste it into your `.env` file!
