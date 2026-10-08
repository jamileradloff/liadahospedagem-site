# Free PDF: "o Caderninho da Lia"

The PDF is generated from HTML and written straight to `public/lia-3-mensagens.pdf`.

```bash
pip install playwright fonttools pypdf
playwright install chromium
python pdf/build.py
```

- Copy and links: `build.py`. The messages are the same as in `src/content.ts`; change both.
- Styles: `style.css`.
- `fonts/` holds static instances of Fraunces, DM Sans, Caveat and DM Mono (OFL license).
  Don't swap them for the variable fonts from Google Fonts: Chrome turns variable fonts into
  Type 3 fonts and the PDF text stops copying correctly.
- Avoid `box-shadow` and gradients with transparency: some PDF viewers render them as solid blocks.
- The output file name never changes (`lia-3-mensagens.pdf`), so links in the page and in DMs keep working.
- The links inside the PDF point to `SITE` (top of `build.py`). Change it if the site address changes.
