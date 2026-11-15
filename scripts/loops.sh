#!/usr/bin/env bash
# The phone and wall encodes of a muted loop in public/work/2026-11: 720 wide at 30 fps, as H.264 (every browser) and
# AV1 (most of them, smaller again). WorkFeed and the viewer pick them by screen width; the full size mp4 stays as is.
# Usage: bash scripts/loops.sh reel-n14.mp4 [more.mp4 ...]   (needs ffmpeg with libx264 and libsvtav1)
# Settings picked on 15 Nov by eye and SSIM against the source: at CRF 30 and 52 the two look alike, and AV1 is smaller.
set -euo pipefail
cd "$(dirname "$0")/../public/work/2026-11"
for f in "$@"; do
  b="${f%.mp4}"
  v="scale=720:-2:flags=lanczos,fps=30"
  ffmpeg -v error -y -i "$f" -vf "$v" -c:v libx264 -preset veryslow -crf 30 -profile:v high -pix_fmt yuv420p -movflags +faststart -an "$b-720.mp4"
  ffmpeg -v error -y -i "$f" -vf "$v" -c:v libsvtav1 -preset 5 -crf 52 -pix_fmt yuv420p -movflags +faststart -an "$b-720-av1.mp4"
  ls -l "$f" "$b-720.mp4" "$b-720-av1.mp4"
done
