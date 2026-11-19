# View Project — Live Project Links

The **View Project** button now opens an available public demo in a **new browser tab**, without opening the project-information popup first. This avoids iframe restrictions for Google Drive and Roblox.

| Project | Button behavior |
|---|---|
| Rumah Adat Lampung 360 | Opens the Google Drive file link you supplied |
| SMK Al Kautsar — Roblox Experience | Opens the Roblox experience link you supplied |
| MetaSchool SMKN 4 Bandar Lampung | Keeps the existing project details popup because no matching link was provided |

**Why a third card?** SMK Al Kautsar is distinct from SMKN 4 Bandar Lampung; no Roblox URL was silently attached to the wrong school. If you intend the Roblox link for a different project, update the project entry deliberately.

## Changing links later (no React edits)

Edit `public/images/projects/project-links.json`:

```json
{
  "rumah-adat-lampung": "https://drive.google.com/file/d/1TyoLyvYYS73jeJcCYg5vKFSajrLSRwE4/view?usp=drive_link",
  "smk-al-kautsar": "https://www.roblox.com/share?code=6eaf53e5e55baa488f57438bc19448c7&type=ExperienceDetails&stamp=1790613151879"
}
```

Use complete `https://` links. To add a public demo for the existing MetaSchool SMKN 4 card, add a key `"metaschool-smkn-4"` to the same JSON object. Setting a link to `null` restores the project details popup. The React component uses built-in defaults for the two supplied URLs if the JSON is missing.

### Images

Image choices are independent of links. Continue to use `public/images/projects/project-images.json` and JPG/JPEG/PNG/WebP/AVIF/GIF/SVG assets in that folder. For the new SMK Al Kautsar card, add `smk-al-kautsar.jpeg` or configure its filename in the image JSON. Until you provide a screenshot, the card falls back to an existing conceptual placeholder SVG.

### Installation on an existing website

1. Back up your project folder.
2. Extract `JuaraMetaCorp_Live_Project_Links_Patch.zip`.
3. Copy the **contents** of its `WEB` folder into the website root (the folder containing `package.json`). Overwrite matching source files. **Do not overwrite your `.env`** or existing project images.
4. Restart `npm run dev` if needed; open `/product` and refresh with `Ctrl + Shift + R`.
5. Check that the shared Drive file has appropriate viewer access and Roblox allows visitors to open the experience.

The patch does not modify SMTP, email configuration, the partner marquee, or existing animations.
