import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// In-memory store for verification codes (in production, use Redis or database)
const verificationCodes = new Map<string, { code: string, expires: number }>()

export async function POST(request: NextRequest) {
  let email: string = ''
  let verificationCode: string = ''
  
  try {
    const requestData = await request.json()
    email = requestData.email
    const password = requestData.password
    
    // Check admin password first
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin2025'
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Geçersiz şifre' }, { status: 401 })
    }

    // Generate 6-digit verification code
    verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store code with 5-minute expiration
    verificationCodes.set(email, {
      code: verificationCode,
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    })

    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      // Development fallback for email verification
      console.log(`Development Mode - Verification Code for ${email}: ${verificationCode}`)
      return NextResponse.json({ 
        message: 'Geliştirme Modu: Doğrulama kodu konsola yazdırıldı.',
        success: true,
        developmentMode: true,
        verificationCode: verificationCode // Only for development
      })
    }

    // Configure email transporter (using Gmail as example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'edirne.events@gmail.com',
      to: email,
      subject: 'Edirne Events - Admin Panel Doğrulama Kodu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C41E3A;">Edirne Events Admin Panel</h2>
          <p>Admin paneline giriş için doğrulama kodunuz:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #C41E3A; font-size: 32px; margin: 0;">${verificationCode}</h1>
          </div>
          <p>Bu kod 5 dakika içinde geçerliliğini yitirecektir.</p>
          <p>Eğer bu isteği siz yapmadıysanız, lütfen bu emaili dikkate almayın.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            Bu otomatik bir emaildir, lütfen yanıtlamayın.
          </p>
        </div>
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ 
      message: 'Doğrulama kodu email adresinize gönderildi',
      success: true 
    })
    
  } catch (error) {
    console.error('Admin verification error:', error)
    
    // If email credentials exist but sending failed, fall back to development mode
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log(`Email send failed, Development Mode - Verification Code for ${email}: ${verificationCode}`)
      return NextResponse.json({ 
        message: 'Email gönderimi başarısız, geliştirme modu aktif.',
        success: true,
        developmentMode: true,
        verificationCode: verificationCode
      })
    }
    
    return NextResponse.json({ 
      error: 'Email gönderilirken hata oluştu. Lütfen tekrar deneyin.' 
    }, { status: 500 })
  }
}

// Verify the code
export async function PUT(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    
    const stored = verificationCodes.get(email)
    if (!stored) {
      return NextResponse.json({ error: 'Doğrulama kodu bulunamadı' }, { status: 400 })
    }
    
    if (Date.now() > stored.expires) {
      verificationCodes.delete(email)
      return NextResponse.json({ error: 'Doğrulama kodu süresi dolmuş' }, { status: 400 })
    }
    
    if (stored.code !== code) {
      return NextResponse.json({ error: 'Geçersiz doğrulama kodu' }, { status: 400 })
    }
    
    // Code is valid, remove it and grant access
    verificationCodes.delete(email)
    
    return NextResponse.json({ 
      message: 'Doğrulama başarılı',
      success: true 
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Doğrulama sırasında hata oluştu' 
    }, { status: 500 })
  }
}