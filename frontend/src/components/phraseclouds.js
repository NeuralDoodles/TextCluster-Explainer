import * as d3 from "d3";
import cloud from "d3-cloud";

var drawnClouds = false;

function drawClouds(words) {
  let factor = 1.1 / Math.sqrt(Math.max(words[0][1], Math.abs(words[0][3])));
  // Removes previously drawn clouds
  if (drawnClouds) {
    d3.select("#positive-cloud").remove();
  } else {
    drawnClouds = true;
  }

  // Removes placeholder images to get rid of jitter
  // d3.select("#pos-placeholder").remove();
  // d3.select("#neg-placeholder").remove();

  var positiveLayout = cloud()
    .size([300, 300])
    .words(
      words.map(function (d) {
        return {
          text: d[0],
          size: Math.sqrt(Math.abs(d[1])) * factor * 20,
        };
      })
    )
    .padding(2)
    .rotate(function () {
      return 0;
    })
    .font("Helvetica")
    .fontSize(function (d) {
      return d.size;
    })
    .on("end", drawPositive);

  positiveLayout.start();

  function drawPositive(words) {
    d3.select("#positive-cloud-div")
      .append("svg")
      .attr("id", "positive-cloud")
      .attr("width", positiveLayout.size()[0])
      .attr("height", positiveLayout.size()[1])
      .append("g")
      .attr(
        "transform",
        "translate(" +
          positiveLayout.size()[0] / 2 +
          "," +
          positiveLayout.size()[1] / 2 +
          ")"
      )
      .selectAll("text")
      .data(words)
      .enter()
      .append("text")
      .style("font-size", function (d) {
        return d.size + "px";
      })
      .style("font-family", "Cambria")
      .style("font-weight", function (d) {
        {console.log(d.size*25);return d.size*25};
      })
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .attr("transform", function (d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function (d) {
        return d.text;
      });
  }

  

  return {
    positiveWords: [words[0][0], words[1][0], words[2][0]],
    negativeWords: words[0][2],
  };
}

export { drawClouds };
