# JuaraMetaCorp Motion Upgrade (v1.2)

## What's new
- Staggered fade/slide/blur on section headings, cards, mission, and partner marquee.
- Smooth fade/slide transitions between Home, About, Products, Partners, and Contact.
- Thin blue/cyan scroll progress indicator fixed to the top of the viewport.
- Slow ambient Hero and page-intro glow; soft animated gradient typography.
- Mouse-following blue spotlight on card backgrounds, with slight pointer tilt on project cards.
- Gentle hover sweep on project thumbnails, buttons, and CTA links.
- Premium shrinking glass navbar after scrolling and subtle footer-wordmark glow.
- Success and error messages on the contact form animate on entry without changing the email API.
- `prefers-reduced-motion` support throughout; partner marquee and background animations can be disabled.

## Updating an existing working project
1. **Back up your website folder first.**
2. Extract `JuaraMetaCorp_Motion_Patch.zip` and copy the files inside `WEB/` over the same paths in your working `WEB/` folder.
3. **Keep the existing `.env` file**, which contains Gmail App Password credentials. Do not upload it or share it.
4. Restart with `npm run dev` and reload the browser with Ctrl+Shift+R.
5. Verify Home scroll animations, page navigation, Partners dragging, and a test project inquiry.

No new npm dependencies are needed: the project already used `motion/react`. The backend
files are unchanged. The static `preview.html` is only an appearance preview; use the
local React app for real route transitions and the live email form.

## Main files
- `src/components/MotionExperience.tsx`: intersection-based reveals and mouse spotlight.
- `src/App.tsx`: page transitions and scroll progress.
- `src/components/PageHero.tsx`: staggered page-header entrance.
- `src/components/Hero.tsx`: animated ambient glow.
- `src/components/Navbar.tsx`: scroll-responsive floating header.
- `src/components/ProjectShowcase.tsx`: image hover sheen hooks.
- `src/pages/ContactPage.tsx`: success/error notice motion.
- `src/site.css`: animations, pointer effects, and reduced-motion fallbacks.

## Performance guidance
Slow decorative animations are lightweight transforms. Avoid overloading the page with
additional large canvas/particle layers on lower-powered phones. Keep animations brief,
and test on actual mobile devices prior to deployment.
