#!/usr/bin/env bash

# File previewer for lf file manager

file="$1"
width="$2"
height="$3"
x="$4"
y="$5"

handle_image() {
    if [ -n "$DISPLAY" ] && [ -z "$WAYLAND_DISPLAY" ] && command -v ueberzug >/dev/null 2>&1; then
        # Use Ueberzug for X11
        ueberzug layer --parser json 0< <(
            {
                printf '{"action": "add", "identifier": "preview", "path": "%s", "x": %d, "y": %d, "width": %d, "height": %d}\n' "$file" "$x" "$y" "$width" "$height"
            }
        )
    elif [ -n "$KITTY_WINDOW_ID" ] && command -v kitty >/dev/null 2>&1; then
        # Use Kitty's built-in image protocol
        kitty +kitten icat --clear --transfer-mode=file --place="${width}x${height}@${x}x${y}" "$file"
    elif command -v chafa >/dev/null 2>&1; then
        # Use chafa for terminal image preview 
        chafa -s "${width}x${height}" "$file"
    elif command -v timg >/dev/null 2>&1; then
        # Try timg as another terminal image viewer
        timg -g "${width}x${height}" "$file"
    else
        # Fallback to basic file info
        file -b "$file"
    fi
}

handle_pdf() {
    if command -v pdftotext >/dev/null 2>&1; then
        # Extract and display text from PDF
        pdftotext -l 10 -nopgbrk -q -- "$file" -
    elif command -v pdftoppm >/dev/null 2>&1 && (command -v chafa >/dev/null 2>&1 || command -v timg >/dev/null 2>&1); then
        # Create an image preview of the first page
        tmp_img="/tmp/lf_pdf_preview.png"
        pdftoppm -png -singlefile -scale-to-x 1024 -scale-to-y -1 "$file" "${tmp_img%.png}"
        
        if command -v chafa >/dev/null 2>&1; then
            chafa -s "${width}x${height}" "$tmp_img"
        elif command -v timg >/dev/null 2>&1; then
            timg -g "${width}x${height}" "$tmp_img"
        fi
        rm "$tmp_img" 2>/dev/null
    else
        # Fallback to metadata display
        file -b "$file"
        echo "Install pdftotext or pdftoppm for better previews"
    fi
}

handle_video() {
    if command -v ffmpegthumbnailer >/dev/null 2>&1; then
        tmp_img="/tmp/lf_video_preview.png"
        ffmpegthumbnailer -i "$file" -o "$tmp_img" -s 0 -q 10
        
        if command -v chafa >/dev/null 2>&1; then
            chafa -s "${width}x${height}" "$tmp_img"
        elif command -v timg >/dev/null 2>&1; then
            timg -g "${width}x${height}" "$tmp_img"
        fi
        rm "$tmp_img" 2>/dev/null
    else
        # Fallback to metadata
        file -b "$file"
        echo "Install ffmpegthumbnailer for video previews"
    fi
}

handle_audio() {
    if command -v exiftool >/dev/null 2>&1; then
        # Show audio metadata
        exiftool "$file" | grep -E 'Title|Artist|Album|Genre|Duration|Bit Rate' | sed 's/^/  /'
    else
        # Basic file info
        file -b "$file"
    fi
}

handle_archive() {
    if command -v atool >/dev/null 2>&1; then
        # List archive contents
        atool --list -- "$file" | head -n 30
    elif command -v bsdtar >/dev/null 2>&1; then
        bsdtar --list --file "$file" | head -n 30
    else
        # Fallback
        file -b "$file"
        echo "Install atool or bsdtar for archive previews"
    fi
}

handle_text() {
    if command -v bat >/dev/null 2>&1; then
        # Use bat for syntax highlighting
        bat --color=always --style=numbers --line-range=:300 "$file"
    elif command -v highlight >/dev/null 2>&1; then
        # Alternative syntax highlighter
        highlight -O ansi --line-numbers "$file"
    else
        # Fallback to plain text
        head -n 300 "$file"
    fi
}

# Detect file type
case "$(file --mime-type -b "$file")" in
    image/*)
        handle_image
        ;;
    application/pdf)
        handle_pdf
        ;;
    video/*)
        handle_video
        ;;
    audio/*)
        handle_audio
        ;;
    application/zip|application/x-7z-compressed|application/x-rar|application/x-tar|application/x-gzip|application/x-bzip2)
        handle_archive
        ;;
    text/*|application/json|application/javascript|application/xml|application/x-shellscript|application/x-yaml)
        handle_text
        ;;
    *)
        file -b "$file"
        ;;
esac

exit 0
