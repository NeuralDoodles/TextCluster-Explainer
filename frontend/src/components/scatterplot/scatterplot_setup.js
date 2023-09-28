import * as d3 from "d3";

export function drawPoint([cx, cy], r, ctx, color, alpha = 0.6, lineWidth = 0.05) {


  // NOTE; each point needs to be drawn as its own path
  // as every point needs its own stroke. you can get an insane
  // speed up if the path is closed after all the points have been drawn
  // and don't mind points not having a stroke
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  //context.closePath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = "black";
  ctx.stroke();
  ctx.fillStyle = color
  ctx.fill();
  ctx.globalAlpha = alpha
  //context.stroke();
}

export function makeCanvas(id, class_name, w, h) {
  var canvas = document.createElement('canvas');

  canvas.setAttribute('className', class_name)
  canvas.setAttribute('id', id)
  canvas.style.position = 'absolute';
  canvas.style.overflow = "visible"

  canvas.style.x = 10;
  canvas.style.y = 10;
  const context = canvas.getContext("2d");


  context.canvas.width = w;
  context.canvas.height = h;
  document.body.appendChild(canvas);

  return canvas, context
}

export function trackPointer(e, { start, move, out, end }) {
  const tracker = {},
    id = (tracker.id = e.pointerId),
    target = e.target;
  tracker.point = d3.pointer(e, target);
  target.setPointerCapture(id);

  d3.select(target)
    .on(`pointerup.${id} pointercancel.${id} lostpointercapture.${id}`, (e) => {
      if (e.pointerId !== id) return;
      tracker.sourceEvent = e;
      d3.select(target).on(`.${id}`, null);
      target.releasePointerCapture(id);
      end && end(tracker);
    })
    .on(`pointermove.${id}`, (e) => {
      if (e.pointerId !== id) return;
      tracker.sourceEvent = e;
      tracker.prev = tracker.point;
      tracker.point = d3.pointer(e, target);
      move && move(tracker);
    })
    .on(`pointerout.${id}`, (e) => {
      if (e.pointerId !== id) return;
      tracker.sourceEvent = e;
      tracker.point = null;
      out && out(tracker);
    });

  start && start(tracker);
}


// Gets the relevant location from a mouse or single touch event
export function getEventLocation(e) {
  if (e.touches && e.touches.length == 1) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  else if (e.clientX && e.clientY) {
    return { x: e.clientX, y: e.clientY }
  }
}

// export function setCustomCursor(cursorImageUrl, hotspotX, hotspotY) {
//   // Create a new cursor element
//   console.log("CHANGE CURSOR")
//   const customCursor = document.createElement("div");
//   customCursor.classList.add("custom-cursor");

//   // Apply cursor styles
//   customCursor.style.position = "absolute";
//   customCursor.style.width = "32px"; // Set the width of the cursor (adjust as needed)
//   customCursor.style.height = "32px"; // Set the height of the cursor (adjust as needed)
//   customCursor.style.backgroundImage = `url('${cursorImageUrl}')`;
//   customCursor.style.backgroundSize = "cover";
//   customCursor.style.pointerEvents = "none";
//   customCursor.style.zIndex = "9999";

//   // Set the cursor hotspot (where it interacts with the page)
//   customCursor.style.transformOrigin = `${hotspotX}px ${hotspotY}px`;

//   // Append the cursor to the document body
//   document.body.appendChild(customCursor);

//   // Update the cursor position
//   document.addEventListener("mousemove", e => {
//     customCursor.style.left = `${e.clientX}px`;
//     customCursor.style.top = `${e.clientY}px`;
//   });
// }