// Sample data for cell parts and links with rich content
const cellData = [
    {
        x: 300,
        y: 80,
        header: "Morphology",
        sections: [
            {
                title: "Related Topics:",
                links: [
                    { text: "Cell Structure", url: "#" },
                    { text: "Membrane Analysis", url: "#" }
                ]
            },
            {
                title: "Tools:",
                links: [
                    { text: "Structure Viewer", url: "#" },
                    { text: "Shape Analysis", url: "#" }
                ]
            }
        ]
    },
    {
        x: 325,
        y: 215,
        header: "Organelle Morphology",
        sections: [
            {
                title: "Related Topics:",
                links: [
                    { text: "Mitochondria", url: "#" },
                    { text: "Golgi Apparatus", url: "#" }
                ]
            },
            {
                title: "Tools:",
                links: [
                    { text: "Organelle Tracker", url: "#" },
                    { text: "3D Visualization", url: "#" }
                ]
            }
        ]
    },{
        x: 175,
        y: 215,
        header: "Biochemistry",
        sections: [
            {
                title: "Related Topics:",
                links: [
                    { text: "Mitochondria", url: "#" },
                    { text: "Golgi Apparatus", url: "#" }
                ]
            },
            {
                title: "Tools:",
                links: [
                    { text: "Organelle Tracker", url: "#" },
                    { text: "3D Visualization", url: "#" }
                ]
            }
        ]
    },{
        x: 100,
        y: 475,
        header: "Motility",
        sections: [
            {
                title: "Related Topics:",
                links: [
                    { text: "Mitochondria", url: "#" },
                    { text: "Golgi Apparatus", url: "#" }
                ]
            },
            {
                title: "Tools:",
                links: [
                    { text: "Organelle Tracker", url: "#" },
                    { text: "3D Visualization", url: "#" }
                ]
            }
        ]
    },
    // Add other cell parts here with the same structure
];

// Dimensions and styling constants
const labelMinWidth = 200;
const labelPadding = 12;
const cornerRadius = 5;
const dotRadius = 15;
const minLineLength = 30;
const margin = 20;
const initialSvgWidth = 1000; // Initial width, used for scaling
const initialSvgHeight = 1000; // Initial height, used for scaling

// Colors
const boxFillColor = "#F4FBFF";
const boxStrokeColor = "#484B50";
const dotFillColor = "#09090A";
const lineStrokeColor = "#484B50";
const fontFamily = "mono";

// Create larger SVG container
const svg = d3.select("#cell-container")
    .append("svg")
    .attr("viewBox", `0 0 ${initialSvgWidth} ${initialSvgHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("max-width", "100%")
    .style("max-height", "100%");

// Center the cell image (using initial dimensions for calculations)
const imageWidth = initialSvgWidth * 0.4;
const imageHeight = initialSvgHeight* 0.5;
const imageX = (initialSvgWidth - imageWidth) / 2;
const imageY = (initialSvgHeight - imageHeight) / 2;

// Define image boundaries (using initial dimensions)
const imageBounds = {
    left: imageX,
    right: imageX + imageWidth,
    top: imageY,
    bottom: imageY + imageHeight
};

svg.append("image")
    .attr("xlink:href", "cell_test_files/cell-image.svg")
    .attr("width", imageWidth)
    .attr("height", imageHeight)
    .attr("x", imageX)
    .attr("y", imageY)
    .attr("preserveAspectRatio", "xMidYMid meet");

// Update data coordinates to match initial SVG size
cellData.forEach(d => {
    d.x = d.x * (imageWidth / 500) + imageX;
    d.y = d.y * (imageHeight / 600) + imageY;
});

// Create cell part groups
const cellParts = svg.selectAll(".cell-part")
    .data(cellData)
    .enter()
    .append("g")
    .attr("class", "cell-part");

// Add outer circles (rings)
cellParts.append("circle")
    .attr("class", "outer-circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 8)
    .attr("fill", "none")
    .attr("stroke", dotFillColor)
    .attr("stroke-width", 1);

// Add inner circles (dots)
cellParts.append("circle")
    .attr("class", "inner-circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 5)
    .attr("fill", dotFillColor)
    .attr("stroke", "none");

let currentlyActive = null;

// Check for overlaps with existing elements
function checkOverlap(x, y, width, height, currentData) {
    const labelBounds = {
        left: x - 5,
        right: x + width + 5,
        top: y - 5,
        bottom: y + height + 5
    };

    // Check image overlap
    const imageBuffer = 10;
    if (!(labelBounds.right < (imageBounds.left - imageBuffer) ||
        labelBounds.left > (imageBounds.right + imageBuffer) ||
        labelBounds.bottom < (imageBounds.top - imageBuffer) ||
        labelBounds.top > (imageBounds.bottom + imageBuffer))) {
        return true;
    }

    // Check dot overlap
    if (cellData.some(dot => {
        if (dot === currentData) return false;
        return !(dot.x - dotRadius > labelBounds.right ||
            dot.x + dotRadius < labelBounds.left ||
            dot.y - dotRadius > labelBounds.bottom ||
            dot.y + dotRadius < labelBounds.top);
    })) {
        return true;
    }

    // Check existing label overlap
    if (currentlyActive) {
        const existingLabels = d3.selectAll('.label-box').nodes();
        return existingLabels.some(labelNode => {
            const labelRect = labelNode.getBoundingClientRect();
            const svgRect = svg.node().getBoundingClientRect();
            const relativeRect = {
                left: labelRect.left - svgRect.left,
                right: labelRect.right - svgRect.left,
                top: labelRect.top - svgRect.top,
                bottom: labelRect.bottom - svgRect.top
            };

            return !(relativeRect.right < labelBounds.left ||
                relativeRect.left > labelBounds.right ||
                relativeRect.bottom < labelBounds.top ||
                relativeRect.top > labelBounds.bottom);
        });
    }

    return false;
}

// Find valid position for label
function findValidPosition(d, labelWidth, labelHeight) {
    const positions = [];
    const dotX = d.x;
    const dotY = d.y;

    // Get current SVG dimensions
    const currentSvgWidth = svg.node().getBoundingClientRect().width;
    const currentSvgHeight = svg.node().getBoundingClientRect().height;

    // Update margin based on current dimensions
    const currentMargin = margin * Math.min(currentSvgWidth / initialSvgWidth, currentSvgHeight / initialSvgHeight);

    // Define quadrants with slight offsets for line connection points
    const offset = 10; // Offset from the exact corner
    const quadrants = [
        { // Top Right
            xStart: dotX,
            xEnd: currentSvgWidth - labelWidth - currentMargin,
            yStart: currentMargin,
            yEnd: dotY - labelHeight - minLineLength,
            lineEnd: (x, y) => ({ x: x + offset, y: y + labelHeight }) // Connect to bottom left with offset
        },
        { // Top Left
            xStart: currentMargin,
            xEnd: dotX - labelWidth - minLineLength,
            yStart: currentMargin,
            yEnd: dotY - labelHeight - minLineLength,
            lineEnd: (x, y) => ({ x: x + labelWidth - offset, y: y + labelHeight }) // Connect to bottom right with offset
        },
        { // Bottom Right
            xStart: dotX,
            xEnd: currentSvgWidth - labelWidth - currentMargin,
            yStart: dotY + minLineLength,
            yEnd: currentSvgHeight - labelHeight - currentMargin,
            lineEnd: (x, y) => ({ x: x + offset, y: y }) // Connect to top left with offset
        },
        { // Bottom Left
            xStart: currentMargin,
            xEnd: dotX - labelWidth - minLineLength,
            yStart: dotY + minLineLength,
            yEnd: currentSvgHeight - labelHeight - currentMargin,
            lineEnd: (x, y) => ({ x: x + labelWidth - offset, y: y}) // Connect to top right with offset
        }
    ];

    // Generate positions in each quadrant
    quadrants.forEach(quadrant => {
        for (let y = quadrant.yStart; y <= quadrant.yEnd; y += labelHeight / 2) {
            for (let x = quadrant.xStart; x <= quadrant.xEnd; x += labelWidth / 2) {
                positions.push({
                    x: x,
                    y: y,
                    lineEnd: quadrant.lineEnd(x, y)
                });
            }
        }
    });

    // Sort positions based on proximity to the dot
    positions.sort((a, b) => {
        const distA = Math.sqrt(Math.pow(a.x + labelWidth / 2 - dotX, 2) + Math.pow(a.y + labelHeight / 2 - dotY, 2));
        const distB = Math.sqrt(Math.pow(b.x + labelWidth / 2 - dotX, 2) + Math.pow(b.y + labelHeight / 2 - dotY, 2));
        return distA - distB;
    });

    // Find first valid position
    for (let pos of positions) {
        if (!checkOverlap(pos.x, pos.y, labelWidth, labelHeight, d)) {
            return pos;
        }
    }

    // Fallback position (relative to current dimensions)
    return {
        x: currentSvgWidth - labelWidth - currentMargin,
        y: currentMargin,
        lineEnd: { x: currentSvgWidth - labelWidth - currentMargin/2, y: currentMargin + labelHeight/2 }
    };
}

// Function to calculate padding needed around the cell image
function calculateRequiredPadding() {
    let maxOverflowX = 0;
    let maxOverflowY = 0;

    // Consider only visible labels
    const visibleLabels = d3.selectAll(".label-group");

    visibleLabels.each(function(d) {
        const labelNode = d3.select(this).select(".label-box").node();
        if (labelNode) {
            const labelRect = labelNode.getBoundingClientRect();
            const svgRect = svg.node().getBoundingClientRect();

            // Calculate overflow relative to initial image boundaries
            const overflowLeft = (imageX * (svgRect.width / initialSvgWidth)) - (labelRect.left - svgRect.left);
            const overflowRight = (labelRect.right - svgRect.left) - ((imageX + imageWidth) * (svgRect.width / initialSvgWidth));
            const overflowTop = (imageY * (svgRect.height/ initialSvgHeight)) - (labelRect.top - svgRect.top);
            const overflowBottom = (labelRect.bottom - svgRect.top) - ((imageY + imageHeight) * (svgRect.height / initialSvgHeight));

            maxOverflowX = Math.max(maxOverflowX, overflowLeft, overflowRight, 0);
            maxOverflowY = Math.max(maxOverflowY, overflowTop, overflowBottom, 0);
        }
    });

    return { x: maxOverflowX, y: maxOverflowY };
}

// Calculate required height for text content
function calculateTextHeight(d) {
    const temp = svg.append("g")
        .attr("class", "temp-text")
        .style("opacity", 0);

    temp.append("text")
        .style("font-family", fontFamily)
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .text(d.header);

    let totalHeight = 25;

    d.sections.forEach(section => {
        temp.append("text")
            .style("font-family", fontFamily)
            .style("font-size", "10px")
            .style("font-weight", "bold")
            .text(section.title);

        totalHeight += 20;
        section.links.forEach(() => {
            totalHeight += 16;
        });
    });

    temp.remove();
    return totalHeight + labelPadding * 2;
}

// Show label for a cell part
function showLabel(group, d) {
    if (currentlyActive === group.node()) return;

    if (currentlyActive) {
        d3.select(currentlyActive).select(".label-group").remove();
    }

    currentlyActive = group.node();
    const labelGroup = group.append("g").attr("class", "label-group");

    const labelHeight = calculateTextHeight(d);
    const labelWidth = labelMinWidth;

    const position = findValidPosition(d, labelWidth, labelHeight);

    // Add connecting line
    const line = labelGroup.append("line")
        .attr("class", "label-line")
        .attr("x1", d.x)
        .attr("y1", d.y)
        .attr("x2", d.x)
        .attr("y2", d.y)
        .attr("stroke", lineStrokeColor)
        .attr("stroke-width", 1);

    // Add label box
    const rect = labelGroup.append("rect")
        .attr("class", "label-box")
        .attr("x", position.x)
        .attr("y", position.y)
        .attr("rx", cornerRadius)
        .attr("ry", cornerRadius)
        .attr("width", 0)
        .attr("height", 0)
        .attr("fill", boxFillColor)
        .attr("stroke", boxStrokeColor)
        .attr("stroke-width", 0.25);

    // Add content group
    const content = labelGroup.append("g")
        .attr("class", "content")
        .style("opacity", 0);

    // Add header
    content.append("text")
        .attr("x", position.x + labelPadding)
        .attr("y", position.y + labelPadding + 12)
        .text(d.header)
        .style("font-family", fontFamily)
        .style("font-size", "12px")
        .style("font-weight", "bold");

    let currentY = position.y + labelPadding + 30;

    // Add sections
    d.sections.forEach(section => {
        content.append("text")
            .attr("x", position.x + labelPadding)
            .attr("y", currentY)
            .text(section.title)
            .style("font-family", fontFamily)
            .style("font-size", "10px")
            .style("font-weight", "bold");

        currentY += 20;

        section.links.forEach(link => {
            const linkGroup = content.append("g")
                .attr("transform", `translate(${position.x + labelPadding}, ${currentY})`);

            linkGroup.append("circle")
                .attr("cx", 4)
                .attr("cy", -3)
                .attr("r", 2)
                .attr("fill", boxStrokeColor);

            linkGroup.append("a")
                .attr("xlink:href", link.url)
                .append("text")
                .attr("x", 12)
                .attr("y", 0)
                .text(link.text)
                .style("font-family", fontFamily)
                .style("font-size", "10px")
                .style("fill", "#0066cc")
                .style("text-decoration", "underline");

            currentY += 16;
        });
    });

    // Animate components
    line.transition()
        .duration(500)
        .attr("x2", position.lineEnd.x)
        .attr("y2", position.lineEnd.y);

    rect.transition()
        .duration(500)
        .attr("width", labelWidth)
        .attr("height", labelHeight)
        .end()  // This returns a promise that resolves when the transition ends
        .then(() => {
            content.transition()
                .duration(300)
                .style("opacity", 1);
        });

    // Ensure proper layering
    labelGroup.select(".label-line").lower();
    group.select(".outer-circle").raise();
    group.select(".inner-circle").raise();
}

// Add hover interaction
cellParts.on("mouseover", function(event, d) {
    showLabel(d3.select(this), d);
});

// Add click handler to close labels when clicking outside
svg.on("click", function(event) {
    if (!event.target.closest('.cell-part')) {
        if (currentlyActive) {
            d3.select(currentlyActive).select(".label-group").remove();
            currentlyActive = null;
        }
    }
});

// Update function for resize and data changes
function updateVisualization() {
    // Get the container dimensions
    const container = document.getElementById('cell-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate the scale factor based on container size
    const scale = Math.min(
        containerWidth / initialSvgWidth,
        containerHeight / initialSvgHeight
    );

    // Calculate required padding
    const padding = calculateRequiredPadding();
    const paddingX = padding.x / scale;
    const paddingY = padding.y / scale;

    // Update viewBox to include padding
    const viewBoxWidth = initialSvgWidth + (paddingX * 2);
    const viewBoxHeight = initialSvgHeight + (paddingY * 2);

    svg.attr("viewBox", `${-paddingX} ${-paddingY} ${viewBoxWidth} ${viewBoxHeight}`);

    // Update existing labels if any are open
    if (currentlyActive) {
        const activeData = d3.select(currentlyActive).datum();
        const labelWidth = labelMinWidth;
        const labelHeight = calculateTextHeight(activeData);
        const newPosition = findValidPosition(activeData, labelWidth, labelHeight);

        const labelGroup = d3.select(currentlyActive).select(".label-group");

        labelGroup.select(".label-line")
            .transition()
            .duration(200)
            .attr("x2", newPosition.lineEnd.x)
            .attr("y2", newPosition.lineEnd.y);

        labelGroup.select(".label-box")
            .transition()
            .duration(200)
            .attr("x", newPosition.x)
            .attr("y", newPosition.y);

        // Update content positions
        const content = labelGroup.select(".content");
        content.selectAll("text, a")
            .each(function(d, i) {
                const elem = d3.select(this);
                const baseX = newPosition.x + labelPadding;
                let baseY = newPosition.y + labelPadding;

                if (elem.classed("header")) {
                    baseY += 12;
                } else if (elem.classed("section-title")) {
                    baseY += 30 + (i * 20);
                } else {
                    baseY += 30 + ((i + 1) * 16);
                }

                elem.attr("x", baseX)
                    .attr("y", baseY);
            });
    }
}

// Initial update and resize handler
updateVisualization(); // Call once initially
window.addEventListener('resize', _.debounce(updateVisualization, 150));
