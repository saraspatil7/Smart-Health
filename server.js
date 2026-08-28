import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

dotenv.config();

const app = express();

/**
 * ✅ KEY SECURITY AND ENGINE INITIALIZATION 
 * (Using backend friendly env notation)
 */
const resend = new Resend(process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY);

/**
 * ✅ DYNAMIC CORS CONFIGURATION
 */
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS security restrictions'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/**
 * ✅ Body Limits Configuration
 */
app.use(express.json({ limit: '10mb' }));

/**
 * ✅ Supabase Cloud Connection Setup
 */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * ✅ Groq SDK Instance Setup
 */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * ✅ System Health Check Ping
 */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running successfully 🚀'
  });
});

/**
 * ✅ Helper: Ensure base64 image has proper data URI prefix
 */
function normalizeBase64Image(imageBase64) {
  if (imageBase64.startsWith('data:image')) {
    return imageBase64;
  }
  return `data:image/jpeg;base64,${imageBase64}`;
}

/**
 * ✅ POST ROUTE: Processes raw Base64 imagery with Groq Vision
 */
app.post('/api/scan-medicine', async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'No image data received'
      });
    }

    const normalizedImage = normalizeBase64Image(imageBase64);

    const response = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct', 
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'You are an AI assistant specialized in analyzing medicine packaging. What is the exact short medicine name? Print ONLY the clear medication name on the very first line, followed by a double line break, and then a brief summary detailing standard usage and dosage precautions on subsequent lines.'
            },
            {
              type: 'image_url',
              image_url: {
                url: normalizedImage
              }
            }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const aiText = response.choices[0]?.message?.content || 'No response generated';

    const lines = aiText.split('\n');
    const detectedName = lines[0]
      ?.replace(/^(Medicine Name:\s*|Name:\s*)/i, '')
      .trim() || 'Unknown Medication';

    const { data, error } = await supabase
      .from('scanned_medicines')
      .insert([
        {
          medicine_name: detectedName,
          raw_ai_analysis: aiText
        }
      ])
      .select();

    if (error) {
      console.error('Supabase Core Insert Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      information: aiText,
      medicineName: detectedName,
      savedRecord: data ? data[0] : null
    });

  } catch (error) {
    const groqError = error?.error?.message || error?.message || 'Unknown error';
    console.error('Operational Backend Error:', groqError);
    res.status(500).json({
      success: false,
      error: groqError
    });
  }
});

/**
 * ✅ GET ROUTE: Fetches recent history arrays
 */
app.get('/api/scanned-list', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('scanned_medicines')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json(data);

  } catch (error) {
    console.error('Database Sync Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * ✅ POST ROUTE: Triggers Automated Appointment Confirmation via Resend
 * (Moved safely above the active app.listen block)
 */
app.post('/api/send-appointment', async (req, res) => {
  const { patientName, email, disease, doctorSpecialist, address, pinCode } = req.body;

  if (!patientName || !email || !doctorSpecialist) {
    return res.status(400).json({ success: false, error: 'Missing required booking fields.' });
  }

  try {
    console.log(`📡 Sending appointment email confirmation to: saraspatil237@gmail.com`);

    const data = await resend.emails.send({
      from: 'SmartHealth Booking <onboarding@resend.dev>', 
      to: ['saraspatil237@gmail.com'], 
      subject: `📅 Appointment Confirmed: ${doctorSpecialist}`,
      html: `
        <div style="font-family: sans-serif; color: #334155; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #2563eb; margin-top: 0; font-size: 20px; font-weight: 800;">Consultation Booking Confirmed</h2>
          <p style="font-size: 14px; line-height: 1.5;">Dear <strong>${patientName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.5;">Your request for a medical appointment has been authorized and registered into our system ledger:</p>
          
          <div style="background-color: #f8fafc; padding: 16px; border: 1px solid #f1f5f9; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Specialist:</strong> ${doctorSpecialist}</p>
            <p style="margin: 6px 0 0 0; color: #475569; font-size: 13px;"><strong>Reported Condition:</strong> ${disease}</p>
            <p style="margin: 6px 0 0 0; color: #475569; font-size: 13px;"><strong>Clinic Location:</strong> ${address}</p>
            <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px;"><strong>Postal Code / PIN:</strong> ${pinCode}</p>
          </div>
          
          <p style="font-size: 11px; color: #94a3b8; margin-top: 30px; line-height: 1.4; border-top: 1px solid #f1f5f9; padding-top: 12px;">
            If you need to reschedule or cancel your session, please contact your clinical helpdesk portal.<br>
            <strong>SmartHealth Medical Systems Management Console</strong>
          </p>
        </div>
      `,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('❌ Resend Booking Error:', error.message);
    res.status(400).json({ success: false, error: error.message });
  }
});

// ⚡ LAUNCH NETWORKING INTERFACE
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

