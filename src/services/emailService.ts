import emailjs from '@emailjs/browser';

// ============================================================================
// EmailJS Service for KoboWise
// ============================================================================
// Configured via Vite environment variables (.env)
// Free accounts at https://www.emailjs.com provide 200 free emails/month.

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() || '';
const TEMPLATE_ID_OTP = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_OTP?.trim() || '';
const TEMPLATE_ID_WAITLIST = import.meta.env.VITE_EMAILJS_TEMPLATE_ID_WAITLIST?.trim() || '';
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
      to_name: toName,
      to_email: toEmail,
      phone_number: phoneNumber || '',
      campus: 'Delta State University (DELSU)',
      perks: 'Zero-commission launch month, verified trader badge, priority catalog listing'
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID_WAITLIST,
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
