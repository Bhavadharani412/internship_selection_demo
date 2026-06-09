# Image Sourcing Manifest

Use downloaded, optimized assets in the repository. Do not hotlink third-party
CDN URLs in production. Record the photographer, source URL, download date, and
license in `src/assets/images/credits.json`.

## Recommended Sources

| Use case | Source | Suggested treatment |
| --- | --- | --- |
| Home hero, bridal story | [Indian bridal on Unsplash](https://unsplash.com/s/photos/indian-bridal) | Portrait crop, warm neutral overlay |
| Specific bridal campaign option | [Bridal jewelry portrait by AL Kaium](https://unsplash.com/photos/a-woman-in-traditional-indian-bridal-jewelry-and-makeup-V7BqhD45b38) | Use only after checking the current license and release notes |
| Ring category and PDP placeholders | [Rings on Unsplash](https://unsplash.com/s/photos/rings) | Square crop, clean background |
| Earrings category | [Earrings on Unsplash](https://unsplash.com/s/photos/earrings) | 4:5 crop, detail-focused |
| Necklace category | [Necklaces on Unsplash](https://unsplash.com/s/photos/necklaces) | 4:5 crop, model and product mix |
| General luxury editorial | [Luxury jewelry on Unsplash](https://unsplash.com/s/photos/luxury-jewelry) | Campaign banners and editorial cards |
| Alternative product photography | [Luxury jewelry on Pexels](https://www.pexels.com/search/luxury%20jewelry/) | Catalog placeholders |

## Asset Pipeline

1. Download selected images from their source page.
2. Store originals outside the web bundle in `assets/source/`.
3. Create AVIF and WebP derivatives at 480, 768, 1200, and 1600 px.
4. Keep product cards at 4:5 and campaign media at 16:9 or 3:4.
5. Add descriptive alt text based on the visible product, not marketing copy.
6. Load the hero eagerly; lazy-load below-the-fold images.
7. Use `srcset` and `sizes` to avoid oversized mobile downloads.

## License Notes

- [Unsplash license](https://unsplash.com/license): images are generally free
  for commercial and non-commercial use; attribution is appreciated. Recheck
  the current source page before use.
- [Pexels license](https://www.pexels.com/license/): photos and videos are
  generally free to use and modify; attribution is not required but is
  appreciated. Restrictions still apply, including implied endorsement.
- Avoid visible third-party jewelry trademarks and do not imply that a model,
  photographer, or source endorses this fictional store.
- For a hiring assignment, include credits even when attribution is optional.

## Credits File Shape

```json
[
  {
    "asset": "bridal-campaign-01.avif",
    "photographer": "Photographer Name",
    "sourceUrl": "https://...",
    "licenseUrl": "https://unsplash.com/license",
    "downloadedAt": "2026-06-08",
    "alt": "Bride wearing layered gold necklaces and earrings"
  }
]
```
