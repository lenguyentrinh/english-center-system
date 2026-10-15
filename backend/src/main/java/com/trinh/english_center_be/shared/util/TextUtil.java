package com.trinh.english_center_be.shared.util;

public final class TextUtil {
    private TextUtil() {}

    /** Strips spaces, dots and dashes from a phone number; blank becomes null (phone is optional). */
    public static String normalizePhone(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("[\\s.\\-]", "");
        return digits.isEmpty() ? null : digits;
    }

    /** Trims; blank becomes null so optional text fields skip their length rules. */
    public static String blankToNull(String text) {
        if (text == null) return null;
        String trimmed = text.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
