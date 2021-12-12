let url = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

//setting up important global variables;

let width = 1000;       // width of the svg canvas
let height = 600;
let leaves;            /*globally initializing a variable to store 
                        all the leaf nodes from our API*/

let colorMap = [
    'rgb(255, 97, 97)', 'rgb(231, 200, 59)', 'rgb(130, 241, 107)',
    'rgb(94, 240, 203)', 'rgb(104, 157, 238)', 'rgb(184, 139, 241)',
    'rgb(245, 159, 202)'
]

// Creating the svg canvas all the necessary HTML tags within the body
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

// Creating legend and it components
function createLegend(){
    // Creating rect elements for each color on the color map
    let legendRect = d3.select('#legend')
        .selectAll('g').data(colorMap)
        .enter().append('g')

    // Coloring rect elements based
    legendRect.append('rect')
        .attr('class', 'legend-item')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', (d,i) => colorMap[i])
        .attr('y', (d, i) => i*20 + i*10)

    // Annotating rect elements
    legendRect.append('text')
            .text((d, i) => {
                let children = data.children
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


let treeMap = () => {
    // Formatting the data
    let hierarchy = d3.hierarchy(data, node => node.children)
                        .sum(node => node['value'])
                        .sort((node1, node2) => node2.value - node1.value)
    leaves = hierarchy.leaves()

    let createTreeMap = d3.treemap()
                            .size([width, height])


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
        .attr('fill', person => {
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
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
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