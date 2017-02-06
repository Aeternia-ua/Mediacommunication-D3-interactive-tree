var diameter = 1024;

var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = diameter,
    height = diameter;
    
var i = 0,
    duration = 350,
    root;

//TODO - FIX LAYOUT 
//d3 tree layout
var tree = d3.layout.tree()
//.nodeSize([110, 110]) 
.size([360, diameter / 2 - 80]) //Radial 360 degree tree layout
//.nodeSize([100, 100])
.separation(function(a, b) { return (a.parent == b.parent ? 1 : 1) / a.depth;
    });

// d3 diagonal projection for use by the node paths
var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

var svg = d3.select("body").append("svg")
//Setting canvas size
    .attr("width", width)
    .attr("height", height)
  .append("g")
//Setting position of the root node in the center of the canvas
    .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

//Retrieving JSON data
d3.json("https://raw.githubusercontent.com/Aeternia-ua/Mediacommunication-D3-interactive-tree/master/mcfields.json", function(error, mcfields) {
  if (error) throw error;
  
// Define the data root
  root = mcfields;
  root.x0 = height / 2;
  root.y0 = 0;

  update(root);
        });
        d3.select(self.frameElement).style("height", "800px");

function update(source) {

  // Compute the new tree layout.
 var nodes = tree.nodes(root).reverse();
  links = d3.layout.tree().links(nodes); 

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    }) 
    .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
  
  // Append images
var images = nodeEnter.append("svg:image")
        .attr("xlink:href",  function(d) { return d.img;})
        .attr("x", function(d) { return -50;})
        .attr("y", function(d) { return -50;})
        .attr("height", 100)
        .attr("width", 100); 

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -50 : -50; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
var nodeUpdate = node.transition()
      .duration(duration)
   .attr("transform", function (d) {
  return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")rotate(" + (-d.x + 90) + ")";
    });
  
  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  //If the node has children, collapse unfolded sibling nodes
    if(d.parent)
        {
            d.parent.children.forEach(function(element){
                
        if(d !== element){
                 collapse(element);
                
                }
            });
        }
  update(d);
}


function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

//TODO - adjust link distance
var force = d3.layout.force()
    .linkDistance(function(d){
        if(d.target._children){
            return 500;//target is not expanded so link distance is 50
        } else {
            return 100;//target is expanded so link distance is 200
        }
    })
.start();