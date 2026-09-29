# Guided Path Phase 17 report

Improved spatial anchors in `AnatomySceneManager`.

- Bounds-derived markers now prefer high-detail merged-group geometry bounds.
- Exact selected-part outlines use the same group-derived bounds.
- Route anchors can receive a controlled teaching-lane offset.
- Metadata bounds remain the explicit fallback for unloaded or low-detail cases.

This improves marker tightness without claiming clinical segmentation.