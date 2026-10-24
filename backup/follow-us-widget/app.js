// BACKUP 2026-10-24: the "आम्हाला फॉलो करा" (Follow Us) widget, taken off the website. See README.md in this folder.
// From frontend/js/app.js, two places:
//   1) the call, in document.addEventListener("DOMContentLoaded", ...), on the line right after  initSheetSwipe();
//        initFollowPlacement();
//   2) the function below, right after the function initSheetSwipe(), above the line  // --- Navigation & Dropdown Handling ---
//      that sits directly over  function initNavigation() {  (app.js has that comment line twice: it is the second one)

// "Follow Us" sits in the right column on desktop. Where the sidebars stack (phones / tablets) it belongs
// directly under the Labels widget, so the very same element is moved there (and back) — nothing is duplicated.
function initFollowPlacement() {
  const follow = document.getElementById("widget-follow");
  const labels = document.getElementById("widget-labels");
  const videos = document.getElementById("widget-videos");
  if (!follow || !labels || !videos) return;

  const stacked = window.matchMedia("(max-width: 980px)");
  const place = () => {
    if (stacked.matches) {
      if (labels.nextElementSibling !== follow) labels.after(follow);
    } else if (videos.previousElementSibling !== follow) {
      videos.before(follow);
    }
  };

  place();
  if (stacked.addEventListener) stacked.addEventListener("change", place);
  else if (stacked.addListener) stacked.addListener(place);   // older Safari
}
