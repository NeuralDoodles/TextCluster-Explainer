// https://observablehq.com/@fil/lasso-selection-canvas@289


function _2(state){return(
state.selected
)}

function _3(state){return(
state.polygon
)}

function _trackPointer(d3){return(
  function trackPointer(e, { start, move, out, end }) {
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
  )}

  
function _lasso(d3,trackPointer){return(
  function lasso() {
    const dispatch = d3.dispatch("start", "lasso", "end");
    const lasso = function(selection) {
      const node = selection.node();
      const polygon = [];
  
      selection
        .on("touchmove", e => e.preventDefault()) // prevent scrolling
        .on("pointerdown", e => {
          trackPointer(e, {
            start: p => {
              polygon.length = 0;
              dispatch.call("start", node, polygon);
            },
            move: p => {
              polygon.push(p.point);
              dispatch.call("lasso", node, polygon);
            },
            end: p => {
              dispatch.call("end", node, polygon);
              const canvas = document.querySelector('canvas');

            

              console.log(canvas)
            }
          });
        });
    };
    lasso.on = function(type, _) {
      return _ ? (dispatch.on(...arguments), lasso) : dispatch.on(...arguments);
    };
  
    return lasso;
  }
  )}

  function measureText(text, font) {
    const span = document.createElement('span');
    span.appendChild(document.createTextNode(text));
    Object.assign(span.style, {
        font: font,
        margin: '0',
        padding: '0',
        border: '0',
        whiteSpace: 'nowrap'
    });
    document.body.appendChild(span);
    const {width, height} = span.getBoundingClientRect();
    span.remove();
    return {width, height};
}
  function drawTooltip(context,x,y,label,alignY=10) {

    const { width, height } = measureText(label, '8px Arial, Helvetica, sans-serif');

    const reactWidth = width + 10;
    const reactHeight = height + 10;
    const reactX = x+12;
    const reactY = y-alignY;
    const labelX = reactX+((reactWidth-width)/2);
    const labelY = reactY+12;

    context.beginPath();

    context.fillStyle = "black";

    context.fillRect(reactX,reactY,reactWidth,reactHeight);
    
    context.font = '8px Arial, Helvetica, sans-serif';

    context.strokeStyle = 'white';

    context.strokeText(label,labelX,labelY);

    context.closePath();
}

function drawTooltips(context,x,y,labels) {
  for (const key in labels) {
      if (Object.hasOwnProperty.call(labels, key)) {
          const label = labels[key];
          drawTooltip(context,x,y+(key*20),label,labels.length*10);
      }
  }
}

function drawPoint(context,x,y,circleRadius,fillStyle,labels=null) {

  context.beginPath();

  context.fillStyle=fillStyle;

  var point = new Path2D();

  point.arc(x,y, circleRadius, 0, 2 * Math.PI);

  context.fill(point);
  
  if(labels)
  {
      drawTooltips(context,x,y,labels);
  }
  context.closePath();
}


function _state(DOM,width,height,d3,data,defaultLasso,lasso)
{ console.log(data)

  

  let x = d3.scaleLinear().range([0,800]),
    y = d3.scaleLinear().range([0,800]);

  var d_extent_x = d3.extent(data, (d) => +d[0]),
    d_extent_y = d3.extent(data, (d) => +d[1]);

  // Draw axes
  x.domain(d_extent_x);
  y.domain(d_extent_y);

  data = data.map((d) => [x(+d[0]), y(+d[1])]);

  const context = DOM.context2d(width, height),
  path = d3.geoPath().context(context);

  drawPoint(context,300,300,20,"rgba(0,0,0,.1)",null)

  
  

  
  function draw(polygon) {
    context.clearRect(0, 0, width, height);

    let cameraZoom = 1
    let MAX_ZOOM = 5
    let MIN_ZOOM = 0.1
    let SCROLL_SENSITIVITY = 0.0005
    let isDragging = false
    let lastZoom = cameraZoom
    /*context.scale(cameraZoom, cameraZoom)

    function adjustZoom(zoomAmount, zoomFactor)
          {
              if (!isDragging)
              {
                  if (zoomAmount)
                  {
                      cameraZoom += zoomAmount
                  }
                  else if (zoomFactor)
                  {
                      console.log(zoomFactor)
                      cameraZoom = zoomFactor*lastZoom
                  }
                  
                  cameraZoom = Math.min( cameraZoom, MAX_ZOOM )
                  cameraZoom = Math.max( cameraZoom, MIN_ZOOM )
                  
                  console.log('AMT',zoomAmount, cameraZoom)
                  context.scale(cameraZoom, cameraZoom)
              }
              }


    console.log(context.canvas)

    context.canvas.addEventListener( 'wheel', (e) => adjustZoom(e.deltaY*SCROLL_SENSITIVITY))
    */


    context.beginPath();
    path({
      type: "LineString",
      coordinates: polygon
    });
    context.fillStyle = "rgba(0,0,0,.1)";
    context.fill("evenodd");
    context.lineWidth = 1.5;
    context.stroke();

    const selected = polygon.length > 2 ? [] : data;


    for (const d of data) {
      const contains =
        polygon.length > 2 &&
        d3.polygonContains(polygon, d) &&
        selected.push(d);
    }
    

    context.beginPath();
    path.pointRadius(1.5)({ type: "MultiPoint", coordinates: data });
    context.fillStyle = "#000";
    context.fill();

    if (polygon.length > 2) {
      context.beginPath();
      path.pointRadius(3.5)({ type: "MultiPoint", coordinates: selected });
      context.fillStyle = "steelblue";
      context.fill();
      
    }
    //console.log(selected)

    context.canvas.value = { polygon, selected };
    context.canvas.dispatchEvent(new CustomEvent('input'));
    var ctx = context.canvas.getContext('2d');
    

    context.canvas.addEventListener('mousemove', function(e) {
      
      var x = e.pageX - context.canvas.offsetLeft;
      var y = e.pageY - context.canvas.offsetTop;
      var str = 'X : ' + x + ', ' + 'Y :' + y;

      ctx.fillStyle = '#222';
      ctx.fillRect(x + 10, y + 10, 80, 25);
      ctx.fillStyle = '#0099f9';
      ctx.font = ' 24px';
      ctx.fillText(str, x + 20, y + 30, 60);

    }, 0);
    
  }
  draw(defaultLasso);
  var cElements = document.getElementsByTagName('canvas');

  console.log(cElements)

  return d3
    .select(context.canvas)
    .call(lasso().on("start lasso end", draw))
    .node();
}


function _defaultLasso(){return(
[
  [366, 143],
  [351, 135],
  [337, 132],
  [318, 130],
  [294, 129],
  [268, 132],
  [247, 141],
  [227, 159],
  [209, 184],
  [197, 214],
  [192, 248],
  [192, 281],
  [201, 310],
  [219, 331],
  [263, 343],
  [315, 339],
  [370, 321],
  [393, 298]
]
)}

function _data(d3,width,height)
{
  const rngx = d3.randomNormal(width / 2, Math.min(width, height) / 5),
    rngy = d3.randomNormal(height / 2, Math.min(width, height) / 5);
  return Array.from({ length: 50 }, () => [rngx(), rngy()]);
}


function _height(width){return(
Math.min(700, width * 0.9)
)}

function _d3(require){return(
require("d3@5", "d3-selection@2.0.0-rc.2")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer("selected")).define(["state"], _2);
  main.variable(observer()).define(["state"], _3);
  main.variable(observer("viewof state")).define("viewof state", ["DOM","width","height","d3","data","defaultLasso","lasso"], _state);
  main.variable(observer("state")).define("state", ["Generators", "viewof state"], (G, _) => G.input(_));
  main.variable(observer("defaultLasso")).define("defaultLasso", _defaultLasso);
  main.variable(observer("data")).define("data", ["d3","width","height"], _data);
  main.variable(observer("height")).define("height", ["width"], _height);
  main.variable(observer("lasso")).define("lasso", ["d3","trackPointer"], _lasso);
  main.variable(observer("trackPointer")).define("trackPointer", ["d3"], _trackPointer);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
