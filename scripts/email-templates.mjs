// Builds the Ronda2Go account emails for Supabase Auth -> Emails -> Templates (confirm sign-up, reset password) into
// docs/email-templates/: <email>.html for the "Body" box and <email>-subject.txt for the "Subject" box.
// Each email is in the language the person used on the site (user_metadata.lang, saved at sign-up), else English.
// Also writes preview-<email>-<lang>.html with a sample link, to look at in a browser.
//
//   node scripts/email-templates.mjs
import fs from 'node:fs'

const OUT = new URL('../docs/email-templates/', import.meta.url)
const SUPPORT = 'support@ronda2go.com'
// The logo must be on a public web address for email apps to load it (public/brand/email/ronda-logo-email.png,
// uploaded to the public "brand" bucket in Supabase Storage until the site has its own address)
const LOGO_URL = 'https://gsbblikilhhpgwyqeimm.supabase.co/storage/v1/object/public/brand/ronda-logo-email.png'
const PREVIEW_LOGO = '../../public/brand/email/ronda-logo-email.png'
const LANGS = ['en', 'ms', 'zh', 'ar']

const TEXT = {
  confirm: {
    en: { subject: 'Confirm your Ronda2Go account', title: 'Welcome to Ronda2Go', body: 'You’re one step away from planning journeys on every train and bus in Malaysia. Confirm your email address to finish creating your account.', button: 'Confirm my email', expiry: 'For your security, this link works once and expires soon.', ignore: 'If you didn’t sign up for Ronda2Go, you can ignore this email. No account will be created.' },
    ms: { subject: 'Sahkan akaun Ronda2Go anda', title: 'Selamat datang ke Ronda2Go', body: 'Tinggal satu langkah lagi untuk merancang perjalanan dengan setiap tren dan bas di Malaysia. Sahkan alamat e-mel anda untuk melengkapkan akaun.', button: 'Sahkan e-mel saya', expiry: 'Demi keselamatan anda, pautan ini hanya boleh digunakan sekali dan akan tamat tempoh tidak lama lagi.', ignore: 'Jika anda tidak mendaftar dengan Ronda2Go, abaikan e-mel ini. Tiada akaun akan dicipta.' },
    zh: { subject: '确认您的 Ronda2Go 账户', title: '欢迎加入 Ronda2Go', body: '只差一步，即可规划马来西亚所有火车和巴士的行程。请确认您的邮箱地址以完成注册。', button: '确认我的邮箱', expiry: '为了您的安全，此链接仅可使用一次，并将很快失效。', ignore: '如果您没有注册 Ronda2Go，请忽略此邮件，账户不会被创建。' },
    ar: { subject: 'أكّد حسابك في Ronda2Go', title: 'مرحبًا بك في Ronda2Go', body: 'أنت على بُعد خطوة واحدة من تخطيط رحلاتك على كل القطارات والحافلات في ماليزيا. أكّد عنوان بريدك الإلكتروني لإكمال إنشاء حسابك.', button: 'تأكيد بريدي الإلكتروني', expiry: 'لحمايتك، يعمل هذا الرابط مرة واحدة وتنتهي صلاحيته قريبًا.', ignore: 'إذا لم تسجّل في Ronda2Go، يمكنك تجاهل هذه الرسالة. لن يتم إنشاء أي حساب.' },
  },
  reset: {
    en: { subject: 'Set a new Ronda2Go password', title: 'Reset your password', body: 'We received a request to set a new password for your Ronda2Go account. Tap the button to choose a new one.', button: 'Set a new password', expiry: 'For your security, this link works once and expires soon.', ignore: 'If you didn’t ask for this, you can ignore this email. Your password stays the same.' },
    ms: { subject: 'Tetapkan kata laluan Ronda2Go baharu', title: 'Tetapkan semula kata laluan', body: 'Kami menerima permintaan untuk menetapkan kata laluan baharu bagi akaun Ronda2Go anda. Tekan butang untuk memilih kata laluan baharu.', button: 'Tetapkan kata laluan baharu', expiry: 'Demi keselamatan anda, pautan ini hanya boleh digunakan sekali dan akan tamat tempoh tidak lama lagi.', ignore: 'Jika anda tidak membuat permintaan ini, abaikan e-mel ini. Kata laluan anda kekal sama.' },
    zh: { subject: '设置新的 Ronda2Go 密码', title: '重置密码', body: '我们收到了为您的 Ronda2Go 账户设置新密码的请求。点击按钮设置新密码。', button: '设置新密码', expiry: '为了您的安全，此链接仅可使用一次，并将很快失效。', ignore: '如果这不是您本人的操作，请忽略此邮件，您的密码不会改变。' },
    ar: { subject: 'عيّن كلمة مرور جديدة لـ Ronda2Go', title: 'إعادة تعيين كلمة المرور', body: 'تلقّينا طلبًا لتعيين كلمة مرور جديدة لحسابك في Ronda2Go. اضغط الزر لاختيار كلمة مرور جديدة.', button: 'تعيين كلمة مرور جديدة', expiry: 'لحمايتك، يعمل هذا الرابط مرة واحدة وتنتهي صلاحيته قريبًا.', ignore: 'إذا لم تطلب ذلك، يمكنك تجاهل هذه الرسالة. ستبقى كلمة مرورك كما هي.' },
  },
}
const COMMON = {
  en: { fallback: 'Button not working? Copy this link into your browser:', help: 'Need help? Email', tagline: 'All of Malaysia’s public transport, in one place.' },
  ms: { fallback: 'Butang tidak berfungsi? Salin pautan ini ke pelayar anda:', help: 'Perlukan bantuan? E-mel', tagline: 'Semua pengangkutan awam Malaysia, di satu tempat.' },
  zh: { fallback: '按钮无法使用？请将此链接复制到浏览器：', help: '需要帮助？请发邮件至', tagline: '马来西亚所有公共交通，尽在一处。' },
  ar: { fallback: 'الزر لا يعمل؟ انسخ هذا الرابط في متصفحك:', help: 'تحتاج مساعدة؟ راسلنا على', tagline: 'كل وسائل النقل العام في ماليزيا، في مكان واحد.' },
}

// The site's blue look: navy #222D52, blue #2F6BD8, pale blue #EAF1FB / #F2F6FB, lines #E3E8EF, grey text #5E6877.
// Tables and inline styles only (email apps); email apps without Playfair Display fall back to Georgia.
const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif"
const SANS = "Inter, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function email(t, c, lang, url, logo = LOGO_URL) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const align = lang === 'ar' ? 'right' : 'left'
  return `<div dir="${dir}" lang="${lang}" style="margin:0;padding:0;background:#F2F6FB;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2F6FB;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E3E8EF;border-radius:20px;">
        <tr><td align="center" style="padding:30px 24px 20px 24px;">
          <img src="${logo}" width="160" alt="Ronda2Go" style="display:block;border:0;height:auto;max-width:160px;font-family:${SERIF};font-size:28px;color:#222D52;font-weight:bold;">
          <div style="font-family:${SANS};font-size:13px;color:#5E6877;margin-top:10px;">${esc(c.tagline)}</div>
        </td></tr>
        <tr><td style="padding:0 36px;"><div style="height:3px;line-height:3px;font-size:0;background:#2F6BD8;border-radius:3px;">&nbsp;</div></td></tr>
        <tr><td style="padding:30px 36px 8px 36px;text-align:${align};">
          <h1 style="margin:0 0 12px 0;font-family:${SERIF};font-size:28px;line-height:1.25;color:#222D52;font-weight:bold;">${esc(t.title)}</h1>
          <p style="margin:0 0 26px 0;font-family:${SANS};font-size:16px;line-height:1.6;color:#384152;">${esc(t.body)}</p>
        </td></tr>
        <tr><td align="center" style="padding:0 36px 26px 36px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" bgcolor="#2F6BD8" style="border-radius:999px;">
              <a href="${url}" style="display:inline-block;padding:15px 34px;font-family:${SANS};font-size:16px;font-weight:bold;color:#FFFFFF;text-decoration:none;border-radius:999px;">${esc(t.button)}</a>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:0 36px 26px 36px;text-align:${align};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td bgcolor="#EAF1FB" style="background:#EAF1FB;border-radius:12px;padding:14px 16px;font-family:${SANS};font-size:14px;line-height:1.5;color:#222D52;text-align:${align};">${esc(t.expiry)}</td>
          </tr></table>
          <p style="margin:16px 0 6px 0;font-family:${SANS};font-size:13px;line-height:1.6;color:#5E6877;">${esc(c.fallback)}</p>
          <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.5;word-break:break-all;"><a href="${url}" style="color:#2F6BD8;">${url}</a></p>
        </td></tr>
        <tr><td style="padding:18px 36px 30px 36px;border-top:1px solid #E3E8EF;text-align:${align};">
          <p style="margin:0 0 8px 0;font-family:${SANS};font-size:13px;line-height:1.6;color:#5E6877;">${esc(t.ignore)}</p>
          <p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.6;color:#5E6877;">${esc(c.help)} <a href="mailto:${SUPPORT}" style="color:#2F6BD8;font-weight:bold;">${SUPPORT}</a></p>
        </td></tr>
      </table>
      <div style="font-family:${SANS};font-size:12px;color:#5E6877;margin-top:14px;">© Ronda2Go</div>
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
