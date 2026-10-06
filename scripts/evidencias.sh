#!/usr/bin/env bash
# Gera um print do `npm test` para cada commit (padrão: main..HEAD) em evidencias/.
# Só considera commits test/feat/fix/refactor; os que já têm print são ignorados, então pode rodar a cada nova fase do TDD.
# Uso: scripts/evidencias.sh [range-ou-commits...]
set -uo pipefail

REPO=$(git rev-parse --show-toplevel)
OUT="$REPO/evidencias"
WT=$(mktemp -d)/wt
mkdir -p "$OUT"
trap 'git -C "$REPO" worktree remove --force "$WT" 2>/dev/null; rm -rf "$(dirname "$WT")"' EXIT

cd "$REPO"
if [ $# -eq 0 ]; then set -- main..HEAD; fi

n=$(find "$OUT" -name '*.png' | wc -l)
for sha in $(git rev-list --reverse "$@"); do
  short=$(git rev-parse --short "$sha")
  if compgen -G "$OUT/*-$short.png" >/dev/null; then continue; fi

  subject=$(git log -1 --format=%s "$sha")
  case "${subject%%:*}" in
    test) phase=red ;;
    feat|fix) phase=green ;;
    refactor) phase=refactor ;;
    *) continue ;; # chore, docs etc. não fazem parte do ciclo TDD
  esac

  git worktree add -q --detach "$WT" "$sha"
  ln -s "$REPO/node_modules" "$WT/node_modules"

  output=$(cd "$WT" && FORCE_COLOR=1 npx jest --ci --colors --verbose 2>&1)
  status=$?
  # Um commit test: que já passa é um teste de proteção, não um red.
  if [ "$phase" = red ] && [ $status -eq 0 ]; then phase=guard; fi

  n=$((n + 1))
  file=$(printf '%s/%02d-%s-%s.png' "$OUT" "$n" "$phase" "$short")
  {
    printf '\e[90m$ git log -1 --format="%%h %%an %%ad %%s" --date=iso\e[0m\n'
    git log -1 --format='%h %an %ad %s' --date=iso "$sha"
    printf '\n\e[90m$ npm test\e[0m\n'
    printf '%s\n' "$output"
    printf '\n\e[90m# executado em %s · exit code %s\e[0m\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$status"
  } | python3 "$REPO/scripts/render_terminal.py" "$file" "certificacao-testes — $short $subject"

  echo "$(basename "$file")  (exit $status)"
  git worktree remove --force "$WT"
done
