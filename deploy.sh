#!/usr/bin/env bash
#
# Build the site and publish it to the web server.
#
#   ./deploy.sh          build, show what would change, ask, then upload
#   ./deploy.sh -n       build and show what would change, then stop
#   ./deploy.sh -y       build and upload without asking
#   ./deploy.sh -f       skip the repository state checks (see below)
#
# Repository state checks
#
#   The site is published with rsync --delete, so the server is made to match the
#   build exactly. That means anything the build does not produce is removed. If a
#   deploy is run from a working tree that was never committed, the result is an
#   article that exists only on the server -- and the next deploy from a clean
#   checkout silently deletes it. That has already happened once, to
#   yusei-sega-world-guidebook-and-flyers, whose source is in no branch.
#
#   So before building:
#     - the working tree must be clean       (hard failure)
#     - the branch must be PUBLISH_BRANCH    (hard failure)
#     - HEAD should be pushed to a remote    (warning only)
#
#   -f overrides all three, for when publishing something uncommitted is genuinely
#   what you want. It should be a deliberate act rather than the default.
#
# Notes on the two rsync/hugo flags that are not optional:
#
#   --cleanDestinationDir   Hugo overwrites but never removes, so without this
#                           public/ accumulates files from previous builds
#                           (renamed covers, dropped sections, old fingerprinted
#                           stylesheets) and rsync happily pushes them back.
#
#   --exclude=.dh-diag      a root-owned DreamHost symlink living in the docroot.
#                           It is not part of the build, so --delete would unlink
#                           it. .htaccess and robots.txt do not need excluding --
#                           they are kept in static/ so the build reproduces them.

set -euo pipefail

HOST="sudden-desu.net"
REMOTE_PATH="~/suddendesu/"
LOCAL_DIR="public"
PUBLISH_BRANCH="master"

RSYNC_OPTS=(-avz --delete --exclude=.dh-diag)

cd "$(dirname "$(readlink -f "$0")")"

die() { echo "error: $*" >&2; exit 1; }

dry_only=false
assume_yes=false
force=false
while getopts ":nyfh" opt; do
	case $opt in
		n) dry_only=true ;;
		y) assume_yes=true ;;
		f) force=true ;;
		h) sed -n '2,36p' "$0" | sed 's/^#\s\?//'; exit 0 ;;
		*) echo "unknown option: -$OPTARG (try -h)" >&2; exit 1 ;;
	esac
done

command -v hugo >/dev/null || die "hugo not found on PATH"

if $force; then
	echo "==> skipping repository state checks (-f)"
elif ! git rev-parse --git-dir >/dev/null 2>&1; then
	echo "warning: not a git repository, skipping state checks" >&2
else
	echo "==> checking repository state"

	dirty=$(git status --porcelain)
	if [[ -n $dirty ]]; then
		echo "$dirty" | sed 's/^/  /' >&2
		die "working tree is dirty. Commit or stash first, or use -f.
       Publishing from an uncommitted tree puts content on the server that
       exists in no commit, and the next clean deploy will delete it."
	fi

	branch=$(git branch --show-current)
	[[ $branch == "$PUBLISH_BRANCH" ]] || die "on branch '$branch', expected '$PUBLISH_BRANCH'.
       Deploying a feature branch publishes its unfinished work and, because
       rsync --delete makes the server match the build, removes anything merged
       to $PUBLISH_BRANCH since you branched. Use -f if you mean it."

	if upstream=$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null); then
		if ! git diff --quiet "$upstream" HEAD 2>/dev/null; then
			echo "  warning: HEAD is not pushed to $upstream -- the source for this" >&2
			echo "           deploy exists only on this machine" >&2
		fi
	else
		echo "  warning: branch has no upstream, cannot verify the source is pushed" >&2
	fi

	echo "  clean, on $branch"
fi

echo
echo "==> building"
hugo --gc --cleanDestinationDir

echo
echo "==> checking what would change on $HOST"
changes=$(rsync "${RSYNC_OPTS[@]}" --dry-run "$LOCAL_DIR/" "$HOST:$REMOTE_PATH")

deletions=$(grep -c '^deleting ' <<<"$changes" || true)
echo "$changes" | grep '^deleting ' | sed 's/^/  /' || true
echo
echo "  $deletions file(s) would be deleted on the server"

if $dry_only; then
	echo
	echo "dry run only, nothing uploaded"
	exit 0
fi

if ! $assume_yes; then
	echo
	read -r -p "upload to $HOST:$REMOTE_PATH ? [y/N] " reply
	[[ $reply =~ ^[Yy]$ ]] || { echo "aborted"; exit 1; }
fi

echo
echo "==> uploading"
rsync "${RSYNC_OPTS[@]}" "$LOCAL_DIR/" "$HOST:$REMOTE_PATH"

echo
echo "==> done: https://$HOST/"
