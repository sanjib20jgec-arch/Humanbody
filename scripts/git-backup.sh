#!/usr/bin/env bash
# Idempotent workspace -> GitHub sync (survives sandbox resets).
# Usage: bash scripts/git-backup.sh "commit message"
set -e
cd /home/user
chmod 600 keys/hbl-deploy 2>/dev/null || true
mkdir -p .ssh
ssh-keyscan -t ed25519 github.com > .ssh/known_hosts 2>/dev/null || true
git init -b main >/dev/null 2>&1
git config user.name "sanjib20jgec-arch"
git config user.email "sanjib20jgec-arch@users.noreply.github.com"
git config core.sshCommand "ssh -i /home/user/keys/hbl-deploy -o UserKnownHostsFile=/home/user/.ssh/known_hosts"
git remote get-url origin >/dev/null 2>&1 || git remote add origin git@github.com:sanjib20jgec-arch/Humanbody.git
git add -A
git commit -q -m "${1:-HBL sync}" || echo "nothing new to commit"
git push -u origin main
