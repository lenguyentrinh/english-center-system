package com.trinh.english_center_be.modules.auth.service;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.web.util.HtmlUtils;

/**
 * HTML bodies of the OTP emails, built in code (no template files). Hand-built for email clients: tables, inline
 * styles and Outlook conditionals, so do not refactor the markup into CSS classes. Every dynamic value is
 * HTML-escaped and substituted in a single pass, so a value can never inject markup or another placeholder.
 */
final class MailTemplates {

    private MailTemplates() {}

    /** The three emails; each carries only the copy that differs. */
    enum Kind {
        VERIFY_EMAIL(
                "Mã xác nhận email", "Mã xác nhận email của bạn", "Xác nhận email",
                "Chào mừng bạn đến với {{appName}}",
                "Cảm ơn bạn đã đăng ký. Nhập mã dưới đây để xác nhận địa chỉ email và bắt đầu lộ trình học của bạn.",
                "Mã xác nhận email", "", "Mở trang xác nhận",
                "Nếu bạn không tạo tài khoản, hãy bỏ qua email này."),
        RESET_PASSWORD(
                "Mã đặt lại mật khẩu", "Mã đặt lại mật khẩu của bạn", "Đặt lại mật khẩu",
                "Yêu cầu đặt lại mật khẩu",
                "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Nhập mã dưới đây để chọn mật khẩu mới.",
                "Mã đặt lại mật khẩu", SECURITY_NOTICE, "Đặt lại mật khẩu",
                "Nếu bạn không yêu cầu, hãy bỏ qua email này — mật khẩu của bạn chưa bị thay đổi."),
        ACCOUNT_INVITE(
                "Mã thiết lập tài khoản", "Trung tâm đã tạo tài khoản cho bạn. Dùng mã này để tạo mật khẩu",
                "Tài khoản mới", "Tài khoản của bạn đã sẵn sàng",
                "{{appName}} vừa tạo tài khoản cho bạn. Dùng mã dưới đây ở màn hình Quên mật khẩu để tạo mật khẩu và đăng nhập.",
                "Mã thiết lập tài khoản", setupSteps(), "Tạo mật khẩu",
                "Nếu bạn không mong đợi email này, hãy bỏ qua.");

        final String title;
        final String preheader;
        final String eyebrow;
        final String heading;
        final String intro;
        final String otpLabel;
        final String extra;
        final String ctaLabel;
        final String note;

        Kind(String title, String preheader, String eyebrow, String heading, String intro, String otpLabel,
             String extra, String ctaLabel, String note) {
            this.title = title;
            this.preheader = preheader;
            this.eyebrow = eyebrow;
            this.heading = heading;
            this.intro = intro;
            this.otpLabel = otpLabel;
            this.extra = extra;
            this.ctaLabel = ctaLabel;
            this.note = note;
        }
    }

    private static final String SANS = "'Nunito Sans',Arial,Helvetica,sans-serif";

    private static final String SECURITY_NOTICE = """
            <tr><td style="padding:0 40px 24px 40px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#fff1f2" style="background:#fff1f2;border:1px solid #fecdd3;border-radius:16px;padding:14px 18px;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#9f1239;mso-line-height-rule:exactly">Vì lý do an toàn, đừng chia sẻ mã này với bất kỳ ai — kể cả nhân viên trung tâm.</td></tr></table>
            </td></tr>
            """;

    private static String setupSteps() {
        String[] steps = {
                "Mở trang <strong style=\"color:#020617\">Quên mật khẩu</strong> và nhập email này.",
                "Nhập mã thiết lập ở trên.",
                "Chọn mật khẩu mới và đăng nhập."};
        StringBuilder sb = new StringBuilder("""
                <tr><td style="padding:0 40px 24px 40px">
                <p style="margin:0 0 14px 0;font-family:%s;font-size:12px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#64748b">Các bước</p>
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" border="0">
                """.formatted(SANS));
        for (int i = 0; i < steps.length; i++) {
            sb.append("""
                    <tr><td width="36" valign="top" style="padding:0 0 12px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="28" height="28" align="center" bgcolor="#020617" style="background:#020617;border-radius:14px;font-family:%s;font-size:13px;font-weight:bold;color:#ffffff;line-height:28px;mso-line-height-rule:exactly">%d</td></tr></table></td><td valign="top" style="padding:4px 0 12px 0;font-family:%s;font-size:15px;line-height:22px;color:#334155;mso-line-height-rule:exactly">%s</td></tr>
                    """.formatted(SANS, i + 1, SANS, steps[i]));
        }
        return sb.append("</table></td></tr>\n").toString();
    }

    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{(\\w+)}}");

    private static final String LAYOUT = """
            <!DOCTYPE html>
            <html lang="vi" xmlns="http://www.w3.org/1999/xhtml">
            <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <title>{{appName}} - {{title}}</title>
            <!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Nunito+Sans:wght@400;700&display=swap" rel="stylesheet"><!--<![endif]-->
            <!--[if mso]><style>table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
            <style>@media (max-width:620px){.px{padding-left:24px!important;padding-right:24px!important}.otp{font-size:32px!important;letter-spacing:8px!important}}</style>
            </head>
            <body style="margin:0;padding:0;background:#f1f5f9;-webkit-text-size-adjust:100%">
            <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all">{{preheader}} — có hiệu lực trong {{ttl}} phút.&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</span>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f1f5f9" style="background:#f1f5f9">
            <tr><td align="center" style="padding:32px 12px">
            <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">
            <tr><td style="padding:0 8px 20px 8px">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="40" height="40" align="center" bgcolor="#020617" style="background:#020617;border-radius:14px;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#ffffff;line-height:40px;mso-line-height-rule:exactly">EC</td>
            <td style="padding-left:12px;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:4px;text-transform:uppercase;color:#64748b">{{appName}}</td>
            </tr></table></td></tr>
            <tr><td bgcolor="#ffffff" style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td height="4" bgcolor="#4f46e5" style="background:#4f46e5;background-image:linear-gradient(to right,#020617,#4f46e5,#06b6d4);height:4px;line-height:4px;font-size:0;border-radius:24px 24px 0 0">&nbsp;</td></tr>
            <tr><td class="px" style="padding:40px 40px 8px 40px">
            <p style="margin:0;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#64748b">{{eyebrow}}</p>
            <h1 style="margin:12px 0 0 0;font-family:Merriweather,Georgia,'Times New Roman',serif;font-size:28px;line-height:36px;font-weight:bold;color:#020617;mso-line-height-rule:exactly">{{heading}}</h1>
            <p style="margin:20px 0 0 0;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#334155;mso-line-height-rule:exactly">Xin chào <strong style="color:#020617">{{name}}</strong>,</p>
            <p style="margin:8px 0 0 0;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#475569;mso-line-height-rule:exactly">{{intro}}</p>
            </td></tr>
            <tr><td class="px" style="padding:24px 40px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#f8fafc" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:24px 16px">
            <p style="margin:0;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#64748b">{{otpLabel}}</p>
            <p class="otp" style="margin:12px 0 0 0;font-family:'Courier New',Courier,monospace;font-size:40px;line-height:48px;font-weight:bold;letter-spacing:12px;color:#020617;mso-line-height-rule:exactly">{{otp}}</p>
            <p style="margin:12px 0 0 0;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#64748b">Hết hạn sau <strong style="color:#334155">{{ttl}} phút</strong> · tối đa 5 lần nhập</p>
            </td></tr></table>
            </td></tr>
            {{extra}}
            <tr><td class="px" style="padding:0 40px 40px 40px">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="#020617" style="background:#020617;border-radius:999px">
            <a href="{{ctaUrl}}" style="display:block;padding:14px 28px;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:999px">{{ctaLabel}}</a>
            </td></tr></table>
            </td></tr>
            <tr><td class="px" style="padding:20px 40px 28px 40px;border-top:1px solid #e2e8f0;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#64748b;mso-line-height-rule:exactly">{{note}}</td></tr>
            </table></td></tr>
            <tr><td style="padding:24px 8px 0 8px;font-family:'Nunito Sans',Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:#94a3b8;mso-line-height-rule:exactly">
            Email tự động từ {{appName}} — vui lòng không trả lời.<br>
            <a href="{{appUrl}}" style="color:#64748b;text-decoration:underline">{{appHost}}</a> · Học đều mỗi ngày, tự tin mỗi ngày.
            </td></tr>
            </table>
            </td></tr></table>
            </body>
            </html>
            """;

    /**
     * @param ctaUrl absolute link behind the button
     * @param appUrl SPA base URL (footer link)
     */
    static String render(Kind kind, String appName, String fullName, String otp, long ttlMinutes,
                         String ctaUrl, String appUrl) {
        Map<String, String> v = new HashMap<>();
        // Markup that is ours, not user data: inserted as is (the copy itself holds no user input).
        v.put("extra", kind.extra);
        v.put("title", kind.title);
        v.put("preheader", kind.preheader);
        v.put("eyebrow", kind.eyebrow);
        v.put("otpLabel", kind.otpLabel);
        v.put("ctaLabel", kind.ctaLabel);
        v.put("note", kind.note);
        // Copy that mentions the app name, then everything that came from outside: escaped.
        String escapedApp = HtmlUtils.htmlEscape(appName, "UTF-8");
        v.put("heading", kind.heading.replace("{{appName}}", escapedApp));
        v.put("intro", kind.intro.replace("{{appName}}", escapedApp));
        v.put("appName", escapedApp);
        v.put("name", HtmlUtils.htmlEscape(displayName(fullName), "UTF-8"));
        v.put("otp", HtmlUtils.htmlEscape(otp, "UTF-8"));
        v.put("ttl", Long.toString(ttlMinutes));
        v.put("ctaUrl", HtmlUtils.htmlEscape(ctaUrl, "UTF-8"));
        v.put("appUrl", HtmlUtils.htmlEscape(appUrl, "UTF-8"));
        v.put("appHost", HtmlUtils.htmlEscape(appUrl.replaceFirst("^https?://", ""), "UTF-8"));

        Matcher m = PLACEHOLDER.matcher(LAYOUT);
        StringBuilder out = new StringBuilder();
        while (m.find()) {
            m.appendReplacement(out, Matcher.quoteReplacement(v.getOrDefault(m.group(1), "")));
        }
        m.appendTail(out);
        return out.toString();
    }

    static String displayName(String fullName) {
        return fullName == null || fullName.isBlank() ? "bạn" : fullName;
    }
}
