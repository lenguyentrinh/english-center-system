package com.trinh.english_center_be.shared.response;

import java.util.List;

/** Page of results: {@code page} is 1-based, {@code total} counts all matches across pages. */
public record PageResponse<T>(List<T> items, long total, int page, int size) {
}
