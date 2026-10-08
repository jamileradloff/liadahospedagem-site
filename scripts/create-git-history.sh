#!/usr/bin/env bash
# Creates the git repository with the history split into small commits, using YOUR git name/email.
# Run once:  bash scripts/create-git-history.sh
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -d .git ]; then
  echo "A git repository already exists here. Nothing was done."
  exit 1
fi

git init -b main >/dev/null

commit() {
  local message="$1"; shift
  git add -- "$@"
  git commit -q -m "$message"
  echo "✓ $message"
}

commit "chore: scaffold Vite + React + TypeScript project" \
  package.json package-lock.json tsconfig.json vite.config.ts .gitignore

commit "feat: add cookieless PostHog analytics with UTM attribution" \
  src/analytics.ts .env.example

commit "feat: add message content and clipboard helpers" \
  src/content.ts src/clipboard.ts src/useCopy.ts

commit "style: add Lia brand tokens and page styles" \
  src/styles.css

commit "feat: add two-screen router and shared components" \
  src/router.ts src/components

commit "feat: add messages screen with copy buttons and anchors" \
  src/screens/MessagesScreen.tsx

commit "feat: add home screen and app entry" \
  src/screens/HomeScreen.tsx src/App.tsx src/main.tsx index.html

commit "chore: add free PDF and social preview image" \
  public/lia-3-mensagens.pdf public/og.png

commit "chore: add PDF source (HTML template, build script and static fonts)" \
  pdf

commit "docs: add README with deploy, analytics and PDF links" \
  README.md scripts/create-git-history.sh

echo
echo "Done! $(git rev-list --count HEAD) commits created."
git status --short
