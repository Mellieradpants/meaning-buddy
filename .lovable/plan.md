

## Plan: Refine Landing Page for Readability and Cognitive Comfort

### Changes (single file: `src/pages/Landing.tsx`)

**1. Visual hierarchy improvements**
- Increase H1 size to `2rem md:2.5rem` (from `1.75rem md:2.25rem`)
- Increase H2 size to `text-xl` (from `text-lg`) with more top margin between sections
- Increase section spacing from `mb-12` to `mb-14` for breathing room
- Confirm section order: Title → Description → Button → What it does → How it works → Example → Detected Changes → Footer

**2. Reading comfort**
- Add `max-w-2xl` constraint on body paragraphs and category list to prevent wide stretching
- Increase line height on body text from `leading-relaxed` to `leading-[1.8]`
- Increase category list item spacing from `space-y-1.5` to `space-y-2.5`
- Keep all typography in existing `font-mono` (headings) and `font-sans` (body) pattern — no changes

**3. Wording refinements** (exact copy from user's request)
- **What it does**: Replace with the two paragraphs provided ("Language Structure Comparison analyzes two versions..." and "The tool does not interpret intent...")
- **How it works**: Update intro line and rewrite each category definition with "A change in..." phrasing as specified

**4. Example section**
- Already has Original / Revised / Operational Effect blocks — keep structure, just ensure spacing is generous (`space-y-4` instead of `space-y-3`, increase padding)

**5. No new features, animations, or decorative elements added**

