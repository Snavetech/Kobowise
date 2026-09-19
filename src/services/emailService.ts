import emailjs from '@emailjs/browser';

// ============================================================================
// EmailJS Service for KoboWise
// ============================================================================
// Configured via Vite environment variables (.env)
// Free accounts at https://www.emailjs.com provide 200 free emails/month.

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() || '';
const TEMPLATE_ID_OTP = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_OTP?.trim() || '';
const TEMPLATE_ID_WAITLIST = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_WAITLIST?.trim() || '';
const TEMPLATE_ID_RECEIPT = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_RECEIPT?.trim() || '';
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() || '';

export interface EmailResult {
  success: boolean;
  error?: string;
  isSimulated?: boolean;
}

/**
 * Checks if EmailJS environment variables are properly configured.
 */
export const isEmailJsConfigured = (): boolean => {
  return Boolean(SERVICE_ID && PUBLIC_KEY);
};

/**
 * Sends a 6-digit OTP verification code to a student buyer.
 */
export const sendVerificationOTP = async (
  toEmail: string,
  toName: string,
  otpCode: string
): Promise<EmailResult> => {
  if (!isEmailJsConfigured() || !TEMPLATE_ID_OTP) {
    console.group('%c[KoboWise EmailJS] Simulated OTP Dispatch', 'color: #2563EB; font-weight: bold;');
    console.log(`Recipient: %c${toName} <${toEmail}>`, 'font-weight: bold;');
    console.log(`6-Digit OTP: %c${otpCode}`, 'color: #059669; font-size: 16px; font-weight: bold;');
    console.log('Note: To send actual emails, configure EmailJS credentials in .env');
    console.groupEnd();

    return {
      success: true,
      isSimulated: true
    };
  }

  try {
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      otp_code: otpCode,
      campus: 'Delta State University (DELSU), Abraka',
      platform: 'KoboWise Campus Marketplace',
      expiry_minutes: '10'
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_OTP,
      templateParams,
      PUBLIC_KEY
    );

    console.log('[KoboWise EmailJS] OTP email sent successfully:', response.status, response.text);
    return { success: true };
  } catch (err: any) {
    console.error('[KoboWise EmailJS] Failed to send OTP email:', err);
    return {
      success: false,
      error: err?.text || err?.message || 'Failed to dispatch verification email via EmailJS.'
    };
  }
};

/**
 * Sends a confirmation / welcome email when a trader joins the waitlist.
 */
export const sendTraderWaitlistEmail = async (
  toName: string,
  toEmail: string,
  phoneNumber?: string
): Promise<EmailResult> => {
  if (!isEmailJsConfigured() || !TEMPLATE_ID_WAITLIST) {
    console.group('%c[KoboWise EmailJS] Simulated Trader Waitlist Email', 'color: #D97706; font-weight: bold;');
    console.log(`Recipient: %c${toName} <${toEmail}>`, 'font-weight: bold;');
    console.log(`Phone: ${phoneNumber || 'N/A'}`);
    console.log('Message: Welcome to KoboWise Trader Waitlist!');
    console.log('Note: To send actual emails, configure EmailJS credentials in .env');
    console.groupEnd();

    return {
      success: true,
      isSimulated: true
    };
  }

  try {
    const templateParams = {
      // Direct keys for trader-waitlist.html
      to_name: toName,
      to_email: toEmail,
      phone_number: phoneNumber || '',
      campus: 'Delta State University (DELSU)',
      perks: 'Zero-commission launch month, verified trader badge, priority catalog listing',

      // Universal keys for universal-notification.html
      email_subject: 'Welcome to the KoboWise Campus Trader Waitlist! 🎉',
      badge_text: 'Official Trader Waitlist • DELSU Campus',
      headline: `Congratulations ${toName}! 🎉`,
      intro_text: 'You have been officially registered on the KoboWise Campus Trader Waitlist for Delta State University (DELSU). You are in line to be among our founding campus traders when live sales open!',
      highlight_label: 'FOUNDING TRADER PRIVILEGES',
      highlight_value: '0% Launch Commission',
      highlight_sub: 'Includes Verified Trader Badge and priority catalog visibility on DELSU feeds.',
      row1_label: 'Trader Name:',
      row1_value: toName,
      row2_label: 'Registered Email:',
      row2_value: toEmail,
      row3_label: 'Phone Number:',
      row3_value: phoneNumber || 'Not Provided',
      row4_label: 'Campus Zone:',
      row4_value: 'Delta State University (DELSU)',
      closing_note: '📦 Our campus onboarding team will reach out with your vendor portal access link prior to public launch.',
      footer_note: 'Sent regarding your vendor waitlist application.'
    };

    const targetTemplateId = TEMPLATE_ID_WAITLIST || TEMPLATE_ID_RECEIPT;

    const response = await emailjs.send(
      SERVICE_ID,
      targetTemplateId,
      templateParams,
      PUBLIC_KEY
    );

    console.log('[KoboWise EmailJS] Waitlist email sent successfully:', response.status, response.text);
    return { success: true };
  } catch (err: any) {
    console.error('[KoboWise EmailJS] Failed to send waitlist email:', err);
    return {
      success: false,
      error: err?.text || err?.message || 'Failed to dispatch waitlist confirmation via EmailJS.'
    };
  }
};

export interface OrderReceiptParams {
  toEmail: string;
  toName: string;
  orderId: string;
  productName: string;
  sharesCount: number | string;
  totalPrice: string;
  pickupLocation: string;
  escrowCode: string;
}

/**
 * Sends an Order Confirmation & Escrow Receipt to the student buyer.
 */
export const sendOrderReceiptEmail = async (
  params: OrderReceiptParams
): Promise<EmailResult> => {
  const targetTemplateId = TEMPLATE_ID_RECEIPT || TEMPLATE_ID_WAITLIST;

  if (!isEmailJsConfigured() || !targetTemplateId) {
    console.group('%c[KoboWise EmailJS] Simulated Order & Escrow Receipt', 'color: #059669; font-weight: bold;');
    console.log(`Recipient: %c${params.toName} <${params.toEmail}>`, 'font-weight: bold;');
    console.log(`Order ID: %c${params.orderId}`, 'font-weight: bold;');
    console.log(`Product: ${params.productName} (${params.sharesCount} share)`);
    console.log(`Total Paid: ${params.totalPrice}`);
    console.log(`Escrow PIN: %c${params.escrowCode}`, 'color: #059669; font-weight: bold; font-size: 14px;');
    console.log(`Pickup Point: ${params.pickupLocation}`);
    console.log('Note: To send actual emails, configure EmailJS credentials in .env');
    console.groupEnd();

    return {
      success: true,
      isSimulated: true
    };
  }

  try {
    const templateParams = {
      // Direct keys for order-receipt.html
      to_name: params.toName,
      to_email: params.toEmail,
      order_id: params.orderId,
      product_name: params.productName,
      shares_count: String(params.sharesCount),
      total_price: params.totalPrice,
      pickup_location: params.pickupLocation,
      escrow_code: params.escrowCode,
      campus: 'Delta State University (DELSU), Abraka',

      // Universal keys for universal-notification.html
      email_subject: `KoboWise Escrow Receipt #${params.orderId} - Payment Secured`,
      badge_text: 'Payment Secured • Escrow Protected',
      headline: `Order Confirmed, ${params.toName}! 🛍️`,
      intro_text: 'Your payment is safely held in KoboWise Escrow. The trader will only receive payment after you collect and inspect your order.',
      highlight_label: 'YOUR ESCROW PICKUP PIN',
      highlight_value: params.escrowCode,
      highlight_sub: 'Show this 4-digit PIN to the trader ONLY after inspecting your items at pickup.',
      row1_label: 'Order Reference:',
      row1_value: params.orderId,
      row2_label: 'Product / Bulk Share:',
      row2_value: `${params.productName} (${params.sharesCount} share)`,
      row3_label: 'Campus Pickup Point:',
      row3_value: params.pickupLocation,
      row4_label: 'Total Paid (Escrowed):',
      row4_value: params.totalPrice,
      closing_note: '📦 How to collect: You will be notified once the group buy completes. Meet at the pickup point with your PIN to collect your share.',
      footer_note: `Receipt for Order #${params.orderId}.`
    };

    const response = await emailjs.send(
      SERVICE_ID,
      targetTemplateId,
      templateParams,
      PUBLIC_KEY
    );

    console.log('[KoboWise EmailJS] Order receipt email sent successfully:', response.status, response.text);
    return { success: true };
  } catch (err: any) {
    console.error('[KoboWise EmailJS] Failed to send order receipt email:', err);
    return {
      success: false,
      error: err?.text || err?.message || 'Failed to dispatch order receipt via EmailJS.'
    };
  }
};
