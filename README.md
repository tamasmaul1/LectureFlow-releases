# LectureFlow releases

Public distribution repository for LectureFlow Windows installers, updater
signatures and stable update metadata. Development source is maintained separately.

No production release is available from this repository yet.

## Downloads and updates

Approved installers will appear under Releases as immutable versioned assets.
The stable feed will be published at:

https://raw.githubusercontent.com/tamasmaul1/LectureFlow-releases/main/stable.json

The feed is intentionally absent until the first qualified, explicitly approved
signed stable release. Repository setup does not advertise an update.

Installed updater-enabled clients check the feed, show a newer compatible stable
version, and download only when the user chooses. Installation is a separate,
guarded action. Compatible unchanged components are reused.

## Release verification

`trust/lectureflow-stable.pub` is the public Tauri/minisign verification key.
The trusted key must already be embedded in the application; downloading a key
from this repository does not establish or replace application trust.

Private signing keys, passwords, local configuration, application data and private
development evidence must never be uploaded here.

Publication is manual: qualify exact bytes, sign with version binding, upload and
verify immutable assets, then advance the stable feed last. Neither source merges
nor this repository's initialization publish a production release.
