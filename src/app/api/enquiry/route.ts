import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getResendClient, FROM_EMAIL } from '@/lib/email/client'

export async function POST(request: NextRequest) {
  try {
    const { companyId, name, email, phone, message } = await request.json()

    if (!companyId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get company details for email
    const { data: company } = await supabase
      .from('companies')
      .select('name, email')
      .eq('id', companyId)
      .single()

    const { error } = await supabase
      .from('enquiries')
      .insert({
        company_id: companyId,
        name,
        email,
        phone,
        message,
        source: 'website',
      })

    if (error) {
      console.error('Failed to save enquiry:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    // Send notification email to company
    const resend = getResendClient()
    if (company?.email && resend) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: company.email,
          subject: `New Enquiry from ${name} - ByTrade`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1f2937;">New Website Enquiry</h2>
              <p style="color: #4b5563;">You've received a new enquiry through your ByTrade website.</p>

              <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${name}</p>
                ${email ? `<p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>` : ''}
                ${phone ? `<p style="margin: 0 0 10px 0;"><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
                ${message ? `<p style="margin: 0;"><strong>Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>` : ''}
              </div>

              <p style="color: #6b7280; font-size: 14px;">
                Respond quickly to increase your chances of winning this job!
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              <p style="color: #9ca3af; font-size: 12px;">
                This email was sent via your ByTrade website.
                <a href="https://bytrade.co.uk/admin">Manage your account</a>
              </p>
            </div>
          `,
        })
        console.log(`[Enquiry] Email sent to ${company.email}`)
      } catch (emailError) {
        console.error('[Enquiry] Failed to send email:', emailError)
        // Don't fail the request if email fails - enquiry is still saved
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Enquiry error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
