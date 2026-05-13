/**
 * ارقام فارسی/عربی را به ۰–۹ ASCII تبدیل می‌کند؛ سپس هر کاراکتر غیر رقم حذف می‌شود.
 * مناسب مبلغ، موبایل، OTP (بدون حفظ نقطه).
 */
export function normalizeToAsciiDigits(input: string): string {
  const normalized = input
    .replace(/[۰-۹]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x06f0),
    )
    .replace(/[٠-٩]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x0660),
    );
  return normalized.replace(/\D/g, "");
}

/**
 * ورودی تاریخ شمسی تایپی مثل 1405.06.28 — فقط رقم و نقطه؛ بدون فرمت زنده که طول را عوض کند.
 */
export function sanitizeJalaliDateTypedInput(
  input: string,
  maxLength = 14,
): string {
  const normalized = input
    .replace(/[۰-۹]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x06f0),
    )
    .replace(/[٠-٩]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x0660),
    );
  const cleaned = normalized.replace(/[^\d.]/g, "");
  return cleaned.length > maxLength ? cleaned.slice(0, maxLength) : cleaned;
}
