# Changelog for webmemex-extension

## 0.4.0 (2020-07-14)

- Store snapshots in the downloads folder *by default*; make storing internally optional. (commit fbebd1c)
- Detect extension upgrade, and notify the user of the new behaviour. (ibid.)
- Add a ‘snapshot & close’ action to the context (right-click) menu of tabs. (commit 7d88b65)
- When snapshotting links in a selection, support multiple selections. (commit 780c0cc)

## 0.3.3 (2019-06-07)

- Add the possibility to programmatically visit and snapshot multiple pages; e.g. all pages that are
  listed in a table of contents (select the links, right-click and choose "snapshot linked pages").
- Update freeze-dry to v0.2.3, so that we…
  - …no longer choke on some invalid URLs (issue #137);
  - …add the proper character encoding declaration to snapshots;
  - …keep/make links within the document (e.g. `<a href="#top">`) relative.
- Update most other dependencies (should not noticeably change much)

## 0.3.2 (2019-05-16)

- Add an options page with:
  - a button to download all snapshots from IndexedDB to the downloads folder.
  - a checkbox to have every new snapshot to directly be saved as a download.

## 0.3.1 (2019-01-08)

- Support opening a snapshot in a new tab.
- If storing to IndexedDB fails, fall back to directly downloading the snapshot.

## 0.3.0 (2018-10-04)

- Thoroughly simplify code base
  - Abandon ambitions for full history logging, smart deduplication, etcetera.
  - Drop half-implemented support for pdf documents (we made them searchable, but did not save them)
  - Drop support for searching through address-/omni-/awesome-bar. Did not seem worth maintaining.
- Change popup behaviour
  - Open snapshots in the current tab
  - Show (other) snapshots when viewing a snapshot
- Consistently show both 'save as' and delete button at every place that had either.
- Fix 'save as' when invoked from the popup (was broken in Firefox)
- Turn overview into a grid layout
- Updated freeze-dry: store provenance metadata inside the snapshot file, parse css properly, etc.

## 0.2.8 (2018-07-30)

Just some dependency fixes.

## 0.2.7 (2018-07-20)

Now also captures content inside frames, after a full rewrite of the underlying freeze-dry code.

## 0.2.6 (2018-05-19)

Change popup interaction; it now lists previous snapshots of the viewed page.
Also some small fixes.

## 0.2.5 (2018-04-02)

Small design tweaks and technical fixes.

## 0.2.4 (2017-08-12)

...
