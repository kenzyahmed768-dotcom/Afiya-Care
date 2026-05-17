function buildInvoiceEmail({
  patientName,
  bookingId,
  serviceType,
  providerName,
  date,
  time,
  location,
  address,
  amount,
  packageName,
  paymentMethod,
  consultationType,
}) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isLab = serviceType === "home-lab";
  const isConsult = serviceType === "consultation";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.08);">
          <tr>
            <td style="background:#0a1628;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">
                Afiya<span style="color:#00b4a2;">Care</span>
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,.6);font-size:13px;">
                Your health, our priority
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#00b4a2;padding:20px 40px;">
              <p style="margin:0;color:#fff;font-size:18px;font-weight:600;">✓ Booking Confirmed</p>
              <p style="margin:4px 0 0;color:rgba(255,255,255,.85);font-size:13px;">
                Booking ID: <strong>#${bookingId}</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 24px;color:#3a4a5c;font-size:15px;">
                Hi <strong>${patientName}</strong>, your appointment has been confirmed. Here are your details:
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dde8ef;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                <tr style="background:#f8fafb;">
                  <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;width:40%;">Service</td>
                  <td style="padding:12px 16px;font-size:14px;color:#0a1628;font-weight:600;">
                    ${
                      serviceType === "home-lab"
                        ? "Home Lab Test"
                        : serviceType === "consultation"
                        ? `Consultation (${consultationType})`
                        : "Physiotherapy"
                    }
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;border-top:1px solid #dde8ef;">
                    ${isLab ? "Lab" : "Doctor"}
                  </td>
                  <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">
                    ${isLab ? providerName : "Dr. " + providerName}
                  </td>
                </tr>

                <tr style="background:#f8fafb;">
                  <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;border-top:1px solid #dde8ef;">Date</td>
                  <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">${formattedDate}</td>
                </tr>

                <tr>
                  <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;border-top:1px solid #dde8ef;">Time</td>
                  <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">${time}</td>
                </tr>

                ${
                  !isConsult
                    ? `
                <tr style="background:#f8fafb;">
                  <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;border-top:1px solid #dde8ef;">Location</td>
                  <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">
                    ${isLab ? address : location === "at-home" ? "At Home — " + address : "At Clinic"}
                  </td>
                </tr>`
                    : ""
                }

                <tr>
                  <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;border-top:1px solid #dde8ef;">Package</td>
                  <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">${packageName}</td>
                </tr>

                <tr style="background:#e6f9f7;">
                  <td style="padding:14px 16px;font-size:13px;font-weight:700;color:#008b7c;text-transform:uppercase;border-top:1px solid #dde8ef;">Total Amount</td>
                  <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#00b4a2;border-top:1px solid #dde8ef;">
                    ${amount.toLocaleString()} EGP
                  </td>
                </tr>

                <tr>
                  <td style="padding:12px 16px;font-size:12px;font-weight:600;color:#6b7c93;text-transform:uppercase;border-top:1px solid #dde8ef;">Payment</td>
                  <td style="padding:12px 16px;font-size:14px;color:#0a1628;border-top:1px solid #dde8ef;">
                    ${paymentMethod === "visa" ? "💳 Visa Card (Paid Online)" : "💵 Cash (Pay on arrival)"}
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#3a4a5c;font-size:14px;">
                Need to cancel? Log into your <strong>patient dashboard</strong> and tap <strong>Cancel</strong>.
              </p>

              <p style="margin:0;color:#3a4a5c;font-size:14px;">
                You will receive a reminder email 24 hours before your appointment.
              </p>
            </td>
          </tr>

          <tr>
            <td style="background:#f8fafb;padding:20px 40px;border-top:1px solid #dde8ef;">
              <p style="margin:0;color:#6b7c93;font-size:12px;">
                AfiyaCare · Alexandria, Egypt · afiyacare@gmail.com · +20 12345677
              </p>
              <p style="margin:4px 0 0;color:#6b7c93;font-size:11px;">
                This is an automated email. Please do not reply directly to this address.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildReminderEmail({ patientName, providerName, date, time, isLab }) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0a1628;padding:28px 40px;">
              <h1 style="margin:0;color:#fff;font-size:22px;">Afiya<span style="color:#00b4a2;">Care</span></h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 12px;color:#0a1628;font-size:20px;">⏰ Appointment Reminder</h2>
              <p style="color:#3a4a5c;font-size:15px;">
                Hi <strong>${patientName}</strong>, this is a reminder that you have an appointment tomorrow:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafb;border-radius:8px;padding:16px;margin:20px 0;">
                <tr>
                  <td style="padding:8px 0;color:#6b7c93;font-size:13px;">With</td>
                  <td style="padding:8px 0;color:#0a1628;font-size:14px;font-weight:600;">
                    ${isLab ? providerName : "Dr. " + providerName}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7c93;font-size:13px;">Date</td>
                  <td style="padding:8px 0;color:#0a1628;font-size:14px;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7c93;font-size:13px;">Time</td>
                  <td style="padding:8px 0;color:#0a1628;font-size:14px;font-weight:600;">${time}</td>
                </tr>
              </table>
              <p style="color:#3a4a5c;font-size:14px;">
                Need to cancel? Log into your patient dashboard before the appointment.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafb;padding:16px 40px;border-top:1px solid #dde8ef;">
              <p style="margin:0;color:#6b7c93;font-size:12px;">AfiyaCare · afiyacare@gmail.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildCancellationEmail({ patientName, providerName, date, time, isLab }) {
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#0a1628;padding:28px 40px;">
              <h1 style="margin:0;color:#fff;font-size:22px;">Afiya<span style="color:#00b4a2;">Care</span></h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <h2 style="margin:0 0 12px;color:#ef4444;font-size:20px;">Appointment Cancelled</h2>
              <p style="color:#3a4a5c;font-size:15px;">
                Hi <strong>${patientName}</strong>, your appointment has been cancelled:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:8px;padding:16px;margin:20px 0;">
                <tr>
                  <td style="padding:8px 0;color:#6b7c93;font-size:13px;">With</td>
                  <td style="padding:8px 0;color:#0a1628;font-size:14px;font-weight:600;">
                    ${isLab ? providerName : "Dr. " + providerName}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7c93;font-size:13px;">Date</td>
                  <td style="padding:8px 0;color:#0a1628;font-size:14px;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7c93;font-size:13px;">Time</td>
                  <td style="padding:8px 0;color:#0a1628;font-size:14px;">${time}</td>
                </tr>
              </table>
              <p style="color:#3a4a5c;font-size:14px;">
                If you did not request this cancellation, please contact us at afiyacare@gmail.com or +20 12345677.
              </p>
              <p style="color:#3a4a5c;font-size:14px;">
                You can book a new appointment anytime on our website.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafb;padding:16px 40px;border-top:1px solid #dde8ef;">
              <p style="margin:0;color:#6b7c93;font-size:12px;">AfiyaCare · afiyacare@gmail.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = {
  buildInvoiceEmail,
  buildReminderEmail,
  buildCancellationEmail,
};