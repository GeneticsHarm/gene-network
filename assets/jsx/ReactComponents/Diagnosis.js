'use strict'

var _ = require('lodash')
var color = require('../../js/color')
var htmlutil = require('../htmlutil')
var genstats = require('genstats')
var prob = genstats.probability

var React = require('react')
var Router = require('react-router')
var DocumentTitle = require('react-document-title')

var SVGCollection = require('./SVGCollection')
var I = SVGCollection.I
var htmlutil = require('../htmlutil')
var color = require('../../js/color')

var reactable = require('reactable')
var Tr = reactable.Tr
var Td = reactable.Td
var Th = reactable.Th
var Thead = reactable.Thead
var Table = reactable.Table
var unsafe = reactable.unsafe


/* For the Z-score colours in the phenotype table: */

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}


/* For the Z-score colours in the phenotype table: */

function getRGB(avg){
    var v = 1-(parseFloat(avg)/20)
    var s = 0.6 + (parseFloat(Math.abs(avg))/7)
    if (parseFloat(avg) >= 0){
        var colors = HSVtoRGB(0.0389, s, v)
        return 'rgb(' + colors.r + ',' + colors.g + ', ' + colors.b + ')'
    } else {
        var colors = HSVtoRGB(0.58, s, v)
        return 'rgb(' + colors.r + ',' + colors.g + ', ' + colors.b + ')'
    }
}

/*Shows a table of the phenotypes used as input, with colours depending on the Z-scores: */

var NetworkButton = React.createClass({

    render: function() {

        var subTable = this.props.prioFiltered
        var urlGenes = ''

        if (subTable) {
            for (var i = 0; i < subTable.length; i++) {
                urlGenes = urlGenes + subTable[i].gene.id + ','
            }
        } else {
            for (var i = 0; i < this.props.prio.results.length; i++) {
                urlGenes = urlGenes + this.props.prio.results[i].gene.id + ','
            }        
        }
        var networkLink = GN.urls.networkPage + urlGenes

        return(<a href={networkLink} target="_blank"><span className='button clickable noselect'>100 GENES NETWORK</span></a>)

        {/*return(<a href={networkLink} target="_blank"><button type="button" >View network of prioritized genes!</button></a>)*/}
    }
})

var DownloadButton = React.createClass({

    render: function() {

        var subTable = this.props.prioFiltered

        if (subTable) {
            // download filtered data
        } else {
            // download unfiltered data       
        }

        return(<span className='button clickable noselect'>DOWNLOAD RESULTS</span>)
    }
})

var ShowPhenotypes3 = React.createClass({


    render: function() {
        var hoverZScores = this.props.hoverItem
        var rows = []

        /* Getting the colour: */
        for (var i = 0; i < this.props.prio.terms.length; i++) {
            var zToCol = hoverZScores ? Math.ceil(hoverZScores[i] * 60) : ''
            var hoverColour =  hoverZScores ? 'rgb(' + zToCol + ',255,255)' : ''
            // var rowtype = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'
            var backgroundColour = hoverZScores ? getRGB(hoverZScores[i]) : 'rgb(0,0,0)'

            /* Coloured squares: */
            var square =
                <div style={this.props.style}>
                <svg viewBox='0 0 10 10' width={20} height={this.props.h}>
                <rect x1='0' y1='0' width='10' height='10' style={{fill: backgroundColour}} />
                </svg>
                </div>


            /* The actual phenotype information: */
            rows.push(
                <tr key={this.props.prio.terms[i].term.name} >
                <td>{square}</td>
                <td style={{textAlign: 'left'}}>{this.props.prio.terms[i].term.name}</td>
                <td style={{textAlign: 'left'}}>{this.props.prio.terms[i].term.numAnnotatedGenes}</td>
                <td style={{textAlign: 'left'}}><a className='nodecoration black' href={this.props.prio.terms[i].term.url} 
                    target="_blank">{this.props.prio.terms[i].term.id}</a></td>
                <td style={{textAlign: 'left'}}>{hoverZScores ? hoverZScores[i] : ""}</td>
                </tr>
                )
        }

        /* The table itself & headers: */
        return (
            <table id="phenTab" className='gn-gene-table datatable' style={{width: '100%'}}>
            <tbody>
            <tr>
            <th></th>
            <th style={{textAlign: 'left'}}>PHENOTYPE</th>
            <th style={{textAlign: 'left'}}>ANNOTATED GENES</th>
            <th style={{textAlign: 'left'}}>HPO-TERM</th>
            <th style={{textAlign: 'left'}}>Z-SCORE</th>
            </tr>
            {rows}
            </tbody>
            </table>
        )
    }
})

/* Shows a table of all of the prioritized genes: */

var GeneTable = React.createClass({

    render: function() {


        var subTable = this.props.prioFiltered

        /* if geneslist is submitted */

        if (subTable) {

            var newRows = []        // Rows in the table

            for (var i = 0; i < subTable.length; i++) {

                var rowtype = i % 2 === 0 ? 'datarow evenrow' : 'datarow oddrow'

                /* network urls: */
                var phens = ""
                for (var j = 0; j < this.props.prio.terms.length; j++) {
                    phens = phens.concat(this.props.prio.terms[j].term.id + ',')
                }
                var gene = "0!" + subTable[i].gene.name
                var networkLink = GN.urls.networkPage + phens + gene

                /* biotype squares: */
                var square =
                    <div style={this.props.style} title={subTable[i].gene.biotype}>
                    <svg viewBox='0 0 10 10' width={20} height={this.props.h}>
                    <rect x1='0' y1='0' width='10' height='10' style={{fill: color.biotype2color[subTable[i].gene.biotype] || color.colors.default}} />
                    </svg>
                    </div>

                /* If impact scorses provided, include column in rows: */
                var impactScore = null
                if (subTable[i].gene.score || subTable[i].gene.score === "") {
                    impactScore = <Td column="IMPACT" style={{textAlign: 'center'}}>{subTable[i].gene.score}</Td>
                } else {
                    impactScore = null
                }

                var geneLink = GN.urls.genePage + subTable[i].gene.name

                newRows.push(
                    <Tr key={i} className = {rowtype} onMouseOver={this.props.onMouseOver.bind(null, subTable[i].predicted)}>
                    <Td column="BIOTYPE" style={{textAlign: 'center'}}>{square}</Td>
                    <Td column="RANK" style={{textAlign: 'center'}}>{i + 1}</Td>
                    <Td column="GENE" style={{textAlign: 'center'}}><a className='nodecoration black' href={geneLink} target="_blank">{subTable[i].gene.name}</a></Td>
                    <Td column="P-VALUE" style={{textAlign: 'center'}}>{unsafe(htmlutil.pValueToReadable(prob.zToP(subTable[i].weightedZScore)))}</Td>
                    <Td column="DIRECTION" style={{textAlign: 'center'}}>{subTable[i].weightedZScore > 0 ? <SVGCollection.TriangleUp className='directiontriangleup' /> : <SVGCollection.TriangleDown className='directiontriangledown' />}</Td>
                    <Td column="ANNOTATION" style={{textAlign: 'center'}}><div title={subTable[i].annotated.length == 0 ? "Not annotated to any of the phenotypes." : subTable[i].annotated}>{subTable[i].annotated.length}</div></Td>
                    <Td column="NETWORK" style={{textAlign: 'center'}}><a href={networkLink} target="_blank"><SVGCollection.NetworkIcon /></a></Td>
                    {impactScore}
                    </Tr>
                )
            }

        } else {

            var newRows = []        // Rows in the table

            for (var i = 0; i < this.props.prio.results.length; i++) {

                
                /* network urls: */
                var phens = ""
                for (var j = 0; j < this.props.prio.terms.length; j++) {
                    phens = phens.concat(this.props.prio.terms[j].term.id + ',')
                }
                var gene = "0!" + this.props.prio.results[i].gene.name
                var networkLink = GN.urls.networkPage + phens + gene

                /* biotype squares: */
                var square =
                    <div style={this.props.style} title={this.props.prio.results[i].gene.biotype}>
                    <svg viewBox='0 0 10 10' width={20} height={this.props.h}>
                    <rect x1='0' y1='0' width='10' height='10' style={{fill: color.biotype2color[this.props.prio.results[i].gene.biotype] || color.colors.default}} />
                    </svg>
                    </div>

                var geneLink = GN.urls.genePage + this.props.prio.results[i].gene.name

                newRows.push(
                    <Tr key={i} onMouseOver={this.props.onMouseOver.bind(null, this.props.prio.results[i].predicted)}>
                    <Td column="" style={{textAlign: 'center'}}>{square}</Td>
                    <Td column="RANK" style={{textAlign: 'center'}}>{i + 1}</Td>
                    <Td column="GENE" style={{textAlign: 'center'}}><a className='nodecoration black' href={geneLink} target="_blank">{this.props.prio.results[i].gene.name}</a></Td>
                    <Td column="P-VALUE" style={{textAlign: 'center'}}>{unsafe(htmlutil.pValueToReadable(prob.zToP(this.props.prio.results[i].weightedZScore)))}</Td>
                    <Td column="DIRECTION" style={{textAlign: 'center'}}>{this.props.prio.results[i].weightedZScore > 0 ? <SVGCollection.TriangleUp className='directiontriangleup' /> : <SVGCollection.TriangleDown className='directiontriangledown' />}</Td>
                    <Td column="ANNOTATION" style={{textAlign: 'center'}}><div title={this.props.prio.results[i].annotated.length == 0 ? "Not annotated to any of the phenotypes." : this.props.prio.results[i].annotated}>{this.props.prio.results[i].annotated.length}</div></Td>
                    <Td column="NETWORK" style={{textAlign: 'center'}}><a href={networkLink} target="_blank"><SVGCollection.NetworkIcon /></a></Td>
                    </Tr>
                )
            }
        }

        /* If variant impact is provided, include header in table: */
        var scoreHeader = null
        if (subTable && subTable.length > 0) {
            if (subTable[0].gene.score || subTable[0].gene.score === "") {
                scoreHeader = <Th column="impact" style={{textAlign: 'center'}}>VAR. IMPACT</Th>
            } else {
                scoreHeader = null
            }
        }

        if (subTable && subTable.length == 0) {
            newRows.push(<Tr key="1"><Td column="">Your list of genes did not match any of the results.</Td></Tr>)
        }

        /* The actual table, with custom sorting: */
        return (<Table id="gentab" className='gn-gene-table datatable sortable diagnosis-table' style={{width: '100%'}} 


            // Attempt at not showing the first two headers, doesn't work???
            // column={[{key: " ", label: 'BIOTYPE'}, {key: " ", label: 'RANK'}, {key: "P-VALUE", label: 'PVALUE'}, {key: "DIRECTION", label: 'DIRECTION'}, {key: "ANNOTATION", label: 'ANNOTATION'}, {key: "NETWORK", label: 'NETWORK'}]}

            sortable={[
                {
                    column: 'GENE',
                    sortFunction: function(a, b) {
                        return a.props.children.localeCompare(b.props.children)
                    }
                }
                    ,

                {
                    column: 'DIRECTION',
                    sortFunction: function(a, b) {
                        return a.props.className.localeCompare(b.props.className)        // Strange: when sorting: 2nd row changes (2 -> 100 -> 51), but all are 'directiontriangleup'
                    }
                },

                {
                    column: 'ANNOTATION',
                    sortFunction: function(a,b) {
                        return b.props.children - a.props.children
                    }
                },

                {
                //P-val: not really necessary (can simply sort using 'rank'), but the user doesn't know that..
                    column: 'P-VALUE',

                    sortFunction: function(a, b) {

                        if (a.length < 5) {
                            if (b.length < 5) {             {/* a ?? b */}
                                return a - b
                            } else if (b[0] != '<') {    {/* a > b */}
                                return 1
                            } else {                        {/* a > b */}
                                return 1
                            }
                        } else if (a[0] != '<') {
                            if (b.length < 5) {             {/* a < b */}
                                return -1
                            } else if (b[0] != '<') {    {/* a ?? b */}

                                a = a.toString()
                                var aExponent = a.slice(53)
                                var aExp = aExponent.slice(0, aExponent.indexOf("<"))
                                var aNumber = a.slice(0,3)

                                b = b.toString()
                                var bExponent = b.slice(53)
                                var bExp = bExponent.slice(0, bExponent.indexOf("<"))
                                var bNumber = b.slice(0,3)

                                return aExp - bExp || aNumber - bNumber

                            } else {                        {/* a > b */}
                                return 1
                            }
                        } else {
                            if (b.length < 5) {             {/* a < b */}
                                return -1
                            } else if (b[0] != '<') {    {/* a <b */}
                                return -1
                            } else {

                                a = a.toString()
                                var aExponent = a.slice(55)
                                var aExp = aExponent.slice(0, aExponent.indexOf("<"))
                                var aNumber = a.slice(2,5)

                                b = b.toString()
                                var bExponent = b.slice(55)
                                var bExp = bExponent.slice(0, bExponent.indexOf("<"))
                                var bNumber = b.slice(2,5)

                                return aExp - bExp || aNumber - bNumber

                            }
                        }

                        return b - a
                    }
                },
            ]}

            >
            <Thead>
                <Th>{""}</Th>
                <Th column="RANK">{" "}</Th>
                <Th column="GENE">{"GENE"}</Th>
                <Th column="P-VALUE"><span title="Please ignore this for now">{"P-VALUE"}</span><I title="Please ignore this for now"/></Th>
                <Th column="DIRECTION"><span title="???">{"DIRECTION"}</span><I title="???"/></Th>
                <Th column="ANNOTATION"><span title="The number of inputted phenotypes the gene is annotated to">{"ANNOTATION"}</span><I title="The number of inputted phenotypes the gene is annotated to"/></Th>
                <Th column="NETWORK">{"NETWORK"}</Th>
            </Thead> 
            {newRows}
            </Table>)
    }
})

// Uses geneslist (& variant scores) provided by user to return new (filtered) data for the GenesTable:

var compareGenes = function (newList, data) {

    /* Splitting submitted geneslist at \n ; , and \t --> into (uppercase) array */
    newList = newList.replace(/\n/g, ' ')
    newList = newList.replace(/;/g, ' ')
    newList = newList.replace(/,/g, ' ')
    newList = newList.replace(/\t/g, ' ')
    var newArray = newList.split(' ')

    var neatArray = []
    for (var i = 0; i < newArray.length; i++) {
        if (newArray[i].length !== 0) {
            neatArray.push(newArray[i])
        }
    }

    var upperCaseArray = []
    for (i = 0; i < neatArray.length; i++) {
        upperCaseArray.push(neatArray[i].toUpperCase())
    }

    /* Storing genesList in two seperate arrays (genes & scores, if available) */
    var snpScores = []
    var neaterArray = []

    for (i = 0; i < upperCaseArray.length; i++) {
        if (isNaN(Number(upperCaseArray[i]))) {
            neaterArray.push(upperCaseArray[i])
            if (isNaN(Number(upperCaseArray[i+1]))) {
                snpScores.push('')
                
            } else {
                snpScores.push(upperCaseArray[i+1])
            }
        } else {
        }
    }

    /* ENSG --> gene-name, pushing results to newTableData array */
    var newTableData = []
    for (var i = 0; i < neaterArray.length; i++) {
        if (neaterArray[i].slice(0,4) == 'ENSG' || neaterArray[i].slice(0,4) == 'ensg') {
            for (var j = 0; j < data.results.length; j++) {
                if (neaterArray[i] == data.results[j].gene.id) {
                    newTableData.push(data.results[j])              /* all info on gene pushed to new array */
                }
            }
        } else {
            for (var j = 0; j < data.results.length; j++) {
                if (neaterArray[i] === data.results[j].gene.name) {
                    newTableData.push(data.results[j])              /* all info on gene pushed to new array */
                }
            }
        }
    }

    /* Checking whether any variant impact scores were provided:*/
    var snpScoresEmptied = []
        for (var i = 0; i < snpScores.length; i++) {
        if (snpScores[i].length !== 0) {
            snpScoresEmptied.push(snpScores[i])
        }
    }

    /* Adding snpScores to gene object (if they're there) */
    for (i = 0; i < snpScores.length; i++) {
        if (snpScoresEmptied.length !== 0) {
            newTableData[i].gene.score = snpScores[i]
        }
    }

    return (newTableData)
}


/* Textbox to paste a list of genes in, to filter the table: */

var PasteBox = React.createClass({

    getInitialState: function() {
        return {newTable: ''}
    },

    handleClick: function(e) {
    },

    render: function() {
        var value = this.state.value 


        var phens = ""
        for (var j = 0; j < this.props.prio.terms.length; j++) {
            phens = phens.concat(this.props.prio.terms[j].term.id + ',')
        }

        var url = GN.urls.main + "/diagnosis/" + phens

        var unfilterButton = this.props.prioFiltered ? <a href={url}><span className="button clickable noselect" >UNFILTER</span></a> : null // Results in error: Invariant Violation: Expected onClick listener to be a function, instead got type string

        return (
            <form>
            <textarea className="textarea-flex" id='pastegenes' placeholder={"\n\n\tPaste a list of genes here to filter the results... \n\n\tYou can also add variant impact scores if \n\tavailable, following the gene name or ID.\n\n\t(E.g. MYOM1 3, BRCA1 2, etc.)"} 
                value={value} onChange={this.handlePasteGenesChange} rows="10"></textarea>

            <br></br>

            <span className="button clickable noselect" onClick={this.props.onFilter}> 
                {this.props.prioFiltered ? 'FILTER AGAIN' : 'FILTER'} </span>            

            {unfilterButton}
            </form>
        )
    }
})


var Diagnosis = React.createClass({

    getInitialState: function() {
        return {
            message: ''
        }
    },

    handleMouseOver: function(hoverGene) {
        this.setState({
            hoverItem: hoverGene
        })
    },
    
    componentDidMount: function() {
        this.loadData()
    },

    componentWillReceiveProps: function(nextProps) {
    },

    handleSubmit: function(submitted) {
        this.setState({
            submitList: submitted
        })
    },

    loadData: function() {
        
        $.ajax({
            url: GN.urls.prioritization + '/' + this.props.params.id + '?verbose',
            dataType: 'json',
            success: function(data) {
                this.setState({
                    data: data
                })
            }.bind(this),
            error: function(xhr, status, err) {
                console.log(xhr)
                if (err === 'Not Found') {
                    this.setState({
                        error: 'Pathways ' + this.props.params.id + ' not found',
                        errorTitle: 'Error ' + xhr.status
                    })
                } else {
                    this.setState({
                        error: 'Please try again later (' + xhr.status + ')',
                        errorTitle: 'Error ' + xhr.status
                    })
                }
            }.bind(this)
        })
    },
    
    onFilter: function(e) {

        var text = document.getElementById('pastegenes').value
        var newTableInfo = compareGenes(text, this.state.data)

        this.setState({
            newTable: newTableInfo
        })

        document.getElementById('pastegenes').value = ''
    },

    render: function() {

        if (!this.state.data) {
            return null
        }


    {/* Idea: 600 px - phenotype height? 


    if (tableHeight != null) {
        var tableHeight = document.getElementById('phenTab').clientHeight

        console.log('height')
        console.log(tableHeight)
    }}

    console.log(document.getElementById('phenTab')) */}

    var thisThese = this.state.data.terms.length == 1 ? 'this ' : 'these '
    var phenotypePhenotypes = this.state.data.terms.length == 1 ? ' phenotype:' : ' phenotypes:'

        return (



          <DocumentTitle title={'Diagnosis' + GN.pageTitleSuffix}>
          <div className="hflex diagflex-container" style={{backgroundColor: '#ffffff'}}>


          

        <div className="prio-tables">

          <div><p></p></div>

{/* style={{width: "70%"}} */}
          <div>{this.state.data ? <ShowPhenotypes3 prio={this.state.data} hoverItem={this.state.hoverItem} /> : 'loading'}</div>

          <div>
          <p>{this.state.data ? 'The ' + this.state.data.results.length + ' highest prioritized genes for the combination of ' + thisThese 
          + this.state.data.terms.length + phenotypePhenotypes : 'loading'}</p>
          </div>

          <div><p></p>
          <NetworkButton prio={this.state.data} prioFiltered={this.state.newTable} />
          <DownloadButton prio={this.state.data} prioFiltered={this.state.newTable} />
          <p></p></div>

{/*, width: "70%"*/}
          <div style={{height: "450px", overflow: "auto"}}>
          <GeneTable prio={this.state.data} prioFiltered={this.state.newTable} onMouseOver={this.handleMouseOver} />
          </div>

        </div>
          
        <div className="prio-pastebox diagflex-container">

          <div className="pastebox-flex"><PasteBox onSubmit={this.handleSubmit} prio={this.state.data} prioFiltered={this.state.newTable} onFilter={this.onFilter} /></div>
        </div>
          </div>
          </DocumentTitle>
        )
    }
})

module.exports = Diagnosis

/*

To do:

- DONE textarea should clear after submitting
- DONE checking for SnpEff scores NOW BETTER
- DONE sortable table
- DONE getting the 'prioFiltered' to the table
- DONE fixing alignment of header & rows in GeneTable
- DONE figure out how to not display the biotype & rank headers
- DONE customize sorting for different columns
- DONE Unfilter button when filtered --> go back to original list

- FIXED problem: pastebox --> when the input is not a gene in the list/there's no input.
- FIXED problem: if you first post a row of genes with var. impacts and then add a new list of genes of which the 1st hasn't got a var imp --> var imp header disappears.
    also: the yellow line disappears at the last column.
- FIXED Ugly fix for the cursor --> hand over the headers (style={{cursor: 'pointer'}}) --> now as a pointer for the whole table. 
    Probably need to change smth. in the css of class 'reactable-header-sortable' (in reactable code?) to do it properly
- FIXED Blue focus border on header when clicked --> 
- FIXED unfilter button error


- have a look at what happens when you sort according to 'direction' --> 2nd row. Weird.
- sometimes after sorting if you move the cursor over the table, the rows change..??
- The 'rowtype' doesn't change when the column is sorted! 
- change colours: grey near score 0
- size of gene table should depend on how much room is left(?)

*/


/*ideas:

- Relationship with the diseases
- Help user choose phenotypes
- Seperate samples based on tissue

*/
