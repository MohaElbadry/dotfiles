#!/usr/bin/env bash

# Clear image preview
if [ -n "$KITTY_WINDOW_ID" ] && command -v kitty >/dev/null 2>&1; then
    kitty +kitten icat --clear --transfer-mode=file
fi

if [ -n "$UEBERZUG_FIFO" ]; then
    printf '{"action": "remove", "identifier": "preview"}\n' > "$UEBERZUG_FIFO"
fi

# Clean temporary files
rm -f /tmp/lf_pdf_preview.png /tmp/lf_video_preview.png 2>/dev/null
