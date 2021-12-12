// SETTING UP OUR GLOBAL VARIABLES

// API url
let url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

let width = 1000;       // width of the svg canvas
let height = 600;
let leaves;            /*globally initializing a variable to store 
                        all the leaf nodes from our API*/

let colorMap = [
    'rgb(255, 97, 97)', 'rgb(231, 200, 59)', 'rgb(130, 241, 107)',
    'rgb(94, 240, 203)', 'rgb(104, 157, 238)', 'rgb(184, 139, 241)',
    'rgb(245, 159, 202)'
]

// CREATING THE SVG CANVASES AND ALL OTHER NECESSARY HTML TAGS
d3.select('body').append('h2')          // Creating an h2 tag using d3.js
    .attr('id', 'title')
    .text('Top Movie Sales')

d3.select('body').append('h2')
    .attr('id', 'description')
    .text('Top most sold movies')    
          
let canvas = d3.select('body').append('svg')            // Main SVG canvas
                .attr('width', width).attr('id', "canvas")
                .attr('height', height)

d3.select('body').append('svg').attr('id', 'legend')      // Creating the legend SVG tag
    .attr('width', 500)


// CREATING OUR TREE MAP USING D3.js METHODS
let treeMap = () => {
    // Formatting the data 
    let hierarchy = d3.hierarchy(data, node => node.children)
                        .sum(node => node['value'])
                        .sort((node1, node2) => node2.value - node1.value)
    leaves = hierarchy.leaves()

    // Designing and fitting the treemap to the formatted data
    let createTreeMap = d3.treemap()
                            .size([width, height])

    /* Calculates the coordinates and area to position blocks representing
        each movie and stores them as property of the hierarchy variable */
    createTreeMap(hierarchy)

    // Creating block elements inside the canvas
    let block = canvas.selectAll('g')
                        .data(leaves)
                        .enter()
                        .append('g')
                        .attr('transform', d => 'translate('+d.x0+', '+d.y0+')')

    // Create tooltip 
    let toolTip = d3.select('body').append('div')
    .attr('id', 'tooltip')

    // Creating rect elements for each datapoint
    block.append('rect')
        .attr('class', 'tile')
        .attr('fill', person => {               // Color each block based on the movie category
            let parentName = person.parent.data.name
            let parentList = person.parent.parent.data.children.map(parentObj => {
                return parentObj.name
            })

            for(let i in parentList) {
                if(parentName == parentList[i]) {
                    return colorMap[i]
                }
            }
        })
        // Dimensions of each block (calculated by our createTreeMap function)
        .attr('width', d => d.x1 - d.x0)           
        .attr('height', d => d.y1 - d.y0)
        .on('mouseover', d => {
            toolTip.transition()
                 .style('visibility', 'visible')
            
            d = d.srcElement.__data__
            toolTip.text('Name: '+d.data.name+', Category: '+d.data.category+', Value: '+d.data.value)
            toolTip.attr('data-value', d.value)
        })
        .on('mouseout', d => {
            toolTip.transition()
                    .style('visibility', 'hidden')
    
        })

    // Adding movie names to rect elements
    block.append('text')
            .text(person => person.data.name)
            .attr('x', 20)
            .attr('y', 20)
            .attr('class', 'tile-label')
}

// CREATING THE LEGEND AND IT'S COMPONENTS
function createLegend(){
    // Creating rect elements for each color on the color map
    let legendRect = d3.select('#legend')
        .selectAll('g').data(colorMap)
        .enter().append('g')

    // Coloring rect elements
    legendRect.append('rect')
        .attr('class', 'legend-item')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', (d,i) => colorMap[i])  /* Color each rect element with the color that has 
                                                the same corresponding index in the colorMap */

        .attr('y', (d, i) => i*20 + i*10)   /* Each rect element should be positioned 10 units 
                                                below the previous in the legend svg canvas*/

    // Annotating rect elements
    legendRect.append('text')           
            .text((d, i) => {                   // Labelling each rect element with 
                let children = data.children    //   the correct movie category
                for (let j in children){
                   if (i == j){
                       return children[i].name
                   }
                }
            })
            .attr('y', (d, i) => i*20 + i*10 - 45)
            .attr('x', 40)
            .attr('class', 'legend-labels')
}

// Pulling API
d3.json(url).then(
    (dataJson, error) => {
        if (error) {console.log(error)}
        else {
            data = dataJson
            
            treeMap()
            createLegend()
        }
    }
)
