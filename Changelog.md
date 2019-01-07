# Changelog for webmemex-extension

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
