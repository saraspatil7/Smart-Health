import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { patientName, email, disease, doctorSpecialist, address, pinCode } = req.body || {};

  if (!patientName || !email || !doctorSpecialist) {
    return res.status(400).json({ success: false, error: "Missing required booking fields." });
  }

  try {
    const data = await resend.emails.send({
      from: "SmartHealth Booking <onboarding@resend.dev>",
      to: ["saraspatil237@gmail.com"],
      subject: `Appointment Confirmed: ${doctorSpecialist}`,
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #2563eb; margin-top: 0; font-size: 20px; font-weight: 800;">Consultation Booking Confirmed</h2>
          <p style="font-size: 14px; line-height: 1.5;">Dear <strong>${patientName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.5;">Your request for a medical appointment has been authorized and registered into our system ledger:</p>
          <div style="background-color: #f8fafc; padding: 16px; border: 1px solid #f1f5f9; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Specialist:</strong> ${doctorSpecialist}</p>
            <p style="margin: 6px 0 0 0; color: #475569; font-size: 13px;"><strong>Reported Condition:</strong> ${disease || "N/A"}</p>
            <p style="margin: 6px 0 0 0; color: #475569; font-size: 13px;"><strong>Clinic Location:</strong> ${address || "N/A"}</p>
            <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px;"><strong>Postal Code / PIN:</strong> ${pinCode || "N/A"}</p>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin-top: 30px; line-height: 1.4; border-top: 1px solid #f1f5f9; padding-top: 12px;">
            If you need to reschedule or cancel your session, please contact your clinical helpdesk portal.<br>
            <strong>SmartHealth Medical Systems Management Console</strong>
          </p>
        </div>
      `,
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Resend Booking Error:", error.message);
    return res.status(400).json({ success: false, error: error.message });
  }
}
