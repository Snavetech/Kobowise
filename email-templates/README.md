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

## 2. Universal Campus Notifications (Trader Waitlist & Order Receipts)
- **File**: [`universal-notification.html`](./universal-notification.html)
- **Subject in EmailJS**: `{{email_subject}}`
- **Matching Environment Variable**: `VITE_EMAILJS_TEMPLATE_ID_WAITLIST`
- **Handles**: Both Trader Waitlist and Order Receipts dynamically on the free plan!
- **Dynamic Variables**:
  - `{{to_name}}` - Recipient's name
  - `{{to_email}}` - Recipient's email
  - `{{email_subject}}` - Dynamic subject line
  - `{{badge_text}}` - Top badge text
  - `{{headline}}` - Main heading
  - `{{intro_text}}` - Summary message
  - `{{highlight_label}}`, `{{highlight_value}}`, `{{highlight_sub}}` - Highlighted card details (PIN or Offer)
  - `{{row1_label}}` - `{{row4_value}}` - Key-value detail rows
  - `{{closing_note}}` - Action steps
  - `{{footer_note}}` - Custom footer note

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
