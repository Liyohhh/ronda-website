// Builds the RONDA account emails for Supabase Auth -> Emails -> Templates (confirm sign-up, reset password) into
// docs/email-templates/: <email>.html for the "Body" box and <email>-subject.txt for the "Subject" box.
// Each email is in the language the person used on the site (user_metadata.lang, saved at sign-up), else English.
// Also writes preview-<email>-<lang>.html with a sample link, to look at in a browser.
//
//   node scripts/email-templates.mjs
import fs from 'node:fs'

const OUT = new URL('../docs/email-templates/', import.meta.url)
const SUPPORT = 'support@ronda2u.com'
// The logo must be on a public web address for email apps to load it (public/brand/email/ronda-logo-email.png,
// uploaded to the public "brand" bucket in Supabase Storage until the site has its own address)
const LOGO_URL = 'https://gsbblikilhhpgwyqeimm.supabase.co/storage/v1/object/public/brand/ronda-logo-email.png'
const PREVIEW_LOGO = '../../public/brand/email/ronda-logo-email.png'
const LANGS = ['en', 'ms', 'zh', 'ar']

const TEXT = {
  confirm: {
    en: { subject: 'Confirm your RONDA account', title: 'Welcome to RONDA', body: 'You’re one step away from planning journeys on every train and bus in Malaysia. Confirm your email address to finish creating your account.', button: 'Confirm my email', expiry: 'For your security, this link works once and expires soon.', ignore: 'If you didn’t sign up for RONDA, you can ignore this email. No account will be created.' },
    ms: { subject: 'Sahkan akaun RONDA anda', title: 'Selamat datang ke RONDA', body: 'Tinggal satu langkah lagi untuk merancang perjalanan dengan setiap tren dan bas di Malaysia. Sahkan alamat e-mel anda untuk melengkapkan akaun.', button: 'Sahkan e-mel saya', expiry: 'Demi keselamatan anda, pautan ini hanya boleh digunakan sekali dan akan tamat tempoh tidak lama lagi.', ignore: 'Jika anda tidak mendaftar dengan RONDA, abaikan e-mel ini. Tiada akaun akan dicipta.' },
    zh: { subject: '确认您的 RONDA 账户', title: '欢迎加入 RONDA', body: '只差一步，即可规划马来西亚所有火车和巴士的行程。请确认您的邮箱地址以完成注册。', button: '确认我的邮箱', expiry: '为了您的安全，此链接仅可使用一次，并将很快失效。', ignore: '如果您没有注册 RONDA，请忽略此邮件，账户不会被创建。' },
    ar: { subject: 'أكّد حسابك في RONDA', title: 'مرحبًا بك في RONDA', body: 'أنت على بُعد خطوة واحدة من تخطيط رحلاتك على كل القطارات والحافلات في ماليزيا. أكّد عنوان بريدك الإلكتروني لإكمال إنشاء حسابك.', button: 'تأكيد بريدي الإلكتروني', expiry: 'لحمايتك، يعمل هذا الرابط مرة واحدة وتنتهي صلاحيته قريبًا.', ignore: 'إذا لم تسجّل في RONDA، يمكنك تجاهل هذه الرسالة. لن يتم إنشاء أي حساب.' },
  },
  reset: {
    en: { subject: 'Set a new RONDA password', title: 'Reset your password', body: 'We received a request to set a new password for your RONDA account. Tap the button to choose a new one.', button: 'Set a new password', expiry: 'For your security, this link works once and expires soon.', ignore: 'If you didn’t ask for this, you can ignore this email. Your password stays the same.' },
    ms: { subject: 'Tetapkan kata laluan RONDA baharu', title: 'Tetapkan semula kata laluan', body: 'Kami menerima permintaan untuk menetapkan kata laluan baharu bagi akaun RONDA anda. Tekan butang untuk memilih kata laluan baharu.', button: 'Tetapkan kata laluan baharu', expiry: 'Demi keselamatan anda, pautan ini hanya boleh digunakan sekali dan akan tamat tempoh tidak lama lagi.', ignore: 'Jika anda tidak membuat permintaan ini, abaikan e-mel ini. Kata laluan anda kekal sama.' },
    zh: { subject: '设置新的 RONDA 密码', title: '重置密码', body: '我们收到了为您的 RONDA 账户设置新密码的请求。点击按钮设置新密码。', button: '设置新密码', expiry: '为了您的安全，此链接仅可使用一次，并将很快失效。', ignore: '如果这不是您本人的操作，请忽略此邮件，您的密码不会改变。' },
    ar: { subject: 'عيّن كلمة مرور جديدة لـ RONDA', title: 'إعادة تعيين كلمة المرور', body: 'تلقّينا طلبًا لتعيين كلمة مرور جديدة لحسابك في RONDA. اضغط الزر لاختيار كلمة مرور جديدة.', button: 'تعيين كلمة مرور جديدة', expiry: 'لحمايتك، يعمل هذا الرابط مرة واحدة وتنتهي صلاحيته قريبًا.', ignore: 'إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة. ستبقى كلمة مرورك كما هي.' },
  },
}
const COMMON = {
  en: { fallback: 'Button not working? Copy this link into your browser:', help: 'Need help? Email', tagline: 'All of Malaysia’s public transport, in one place.' },
  ms: { fallback: 'Butang tidak berfungsi? Salin pautan ini ke pelayar anda:', help: 'Perlukan bantuan? E-mel', tagline: 'Semua pengangkutan awam Malaysia, di satu tempat.' },
  zh: { fallback: '按钮无法使用？请将此链接复制到浏览器：', help: '需要帮助？请发邮件至', tagline: '马来西亚所有公共交通，尽在一处。' },
  ar: { fallback: 'الزر لا يعمل؟ انسخ هذا الرابط في متصفحك:', help: 'تحتاج مساعدة؟ راسلنا على', tagline: 'كل وسائل النقل العام في ماليزيا، في مكان واحد.' },
}

// Luxe & Elegant: velvet #222D52, champagne #D2B68A, silk #EEE5D9. Tables and inline styles only (email apps).
const SERIF = "Georgia, 'Times New Roman', serif"
const SANS = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function email(t, c, lang, url, logo = LOGO_URL) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const align = lang === 'ar' ? 'right' : 'left'
  return `<div dir="${dir}" lang="${lang}" style="margin:0;padding:0;background:#EEE5D9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#EEE5D9;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FFFFFF;border-radius:20px;overflow:hidden;">
        <tr><td align="center" style="background:#FFFFFF;padding:30px 24px 22px 24px;border-bottom:2px solid #D2B68A;">
          <img src="${logo}" width="170" alt="RONDA" style="display:block;border:0;height:auto;max-width:170px;font-family:${SERIF};font-size:28px;letter-spacing:6px;color:#222D52;font-weight:bold;">
          <div style="font-family:${SANS};font-size:13px;color:#6B655E;margin-top:10px;">${esc(c.tagline)}</div>
        </td></tr>
        <tr><td style="padding:36px 36px 8px 36px;text-align:${align};">
          <div style="width:48px;height:2px;background:#D2B68A;margin-bottom:18px;${lang === 'ar' ? 'margin-left:auto;' : ''}"></div>
          <h1 style="margin:0 0 14px 0;font-family:${SERIF};font-size:28px;line-height:1.25;color:#222D52;font-weight:bold;">${esc(t.title)}</h1>
          <p style="margin:0 0 28px 0;font-family:${SANS};font-size:16px;line-height:1.6;color:#403C37;">${esc(t.body)}</p>
        </td></tr>
        <tr><td align="center" style="padding:0 36px 28px 36px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" bgcolor="#222D52" style="border-radius:999px;">
              <a href="${url}" style="display:inline-block;padding:15px 34px;font-family:${SANS};font-size:16px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:999px;">${esc(t.button)}</a>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:0 36px 28px 36px;text-align:${align};">
          <p style="margin:0 0 16px 0;font-family:${SANS};font-size:14px;line-height:1.6;color:#6B655E;">${esc(t.expiry)}</p>
          <p style="margin:0 0 6px 0;font-family:${SANS};font-size:13px;line-height:1.6;color:#6B655E;">${esc(c.fallback)}</p>
          <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.5;word-break:break-all;"><a href="${url}" style="color:#222D52;">${url}</a></p>
        </td></tr>
        <tr><td style="padding:20px 36px 32px 36px;border-top:1px solid #E8E4E0;text-align:${align};">
          <p style="margin:0 0 10px 0;font-family:${SANS};font-size:13px;line-height:1.6;color:#6B655E;">${esc(t.ignore)}</p>
          <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.6;color:#6B655E;">${esc(c.help)} <a href="mailto:${SUPPORT}" style="color:#222D52;font-weight:bold;">${SUPPORT}</a></p>
        </td></tr>
      </table>
      <div style="font-family:${SANS};font-size:12px;color:#6B655E;margin-top:16px;">© RONDA</div>
    </td></tr>
  </table>
</div>`
}

// Go template (Supabase): pick the block for the saved language; no language saved = English
const pick = (parts) =>
  `{{ $lang := or .Data.lang "en" }}` +
  LANGS.slice(1).map((l, i) => `{{ ${i === 0 ? 'if' : 'else if'} eq $lang "${l}" }}${parts[l]}`).join('') +
  `{{ else }}${parts.en}{{ end }}`

fs.mkdirSync(OUT, { recursive: true })
for (const [name, texts] of Object.entries(TEXT)) {
  const bodies = Object.fromEntries(LANGS.map((l) => [l, email(texts[l], COMMON[l], l, '{{ .ConfirmationURL }}')]))
  fs.writeFileSync(new URL(`${name}.html`, OUT), pick(bodies) + '\n')
  fs.writeFileSync(new URL(`${name}-subject.txt`, OUT), pick(Object.fromEntries(LANGS.map((l) => [l, texts[l].subject]))) + '\n')
  for (const l of LANGS) {
    const page = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(texts[l].subject)}</title></head><body style="margin:0;">${email(texts[l], COMMON[l], l, 'https://example.test/confirm-link-sample', PREVIEW_LOGO)}</body></html>`
    fs.writeFileSync(new URL(`preview-${name}-${l}.html`, OUT), page)
  }
}
console.log(`${Object.keys(TEXT).length} emails x ${LANGS.length} languages -> docs/email-templates/`)
