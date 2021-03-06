'use strict'

var _ = require('lodash')
var React = require('react')
var ReactDOM = require('react-dom')
var Router = require('react-router')
var Select = require('react-select')
var DocumentTitle = require('react-document-title')
var Route = Router.Route

var GeneHeader = require('./GeneHeader')
var GeneMenu = require('./GeneMenu')
var SimilarGenesTable = require('./SimilarGenesTable')
var Tissues = require('./Tissues')
var DownloadPanel = require('../DownloadPanel')
var SVGCollection = require('../SVGCollection')
var Cookies = require('cookies-js')
var color = require('../../../js/color')
var htmlutil = require('../../htmlutil')
var DataTable = require('../DataTable')

var Gene = React.createClass({

    mixins: [Router.Navigation, Router.State],

    getInitialState: function() {
        
        return {
            topMenuSelection: Cookies.get('genetopmenu') || 'prediction',
            //topMenuSelection: 'prediction',
            databaseSelection: Cookies.get('genedb') || 'REACTOME',
            // showTypeSelection: Cookies.get('geneshowtype') || 'prediction'
        }
    },

    loadData: function(geneId) {

        if (!geneId) geneId = this.props.params.geneId

        var tasks = [{url: GN.urls.gene + '/' + geneId + '?verbose',
                      name: 'prediction'},
                     {url: GN.urls.coregulation + '/' + geneId + '?verbose',
                      name: 'similar'}]
        if (this.state.topMenuSelection == 'similar') {
            tasks.reverse()
        }
        var that = this
        _.forEach(tasks, function(task) {
            $.ajax({
                url: task.url,
                dataType: 'json',
                success: function(data) {
                    if (this.isMounted() && task.name == 'prediction') {
                        this.setState({
                            gene: data.gene,
                            celltypes: data.celltypes,
                            prediction: data,
                            error: null
                        })
                    } else if (this.isMounted() && task.name == 'similar') {
                        this.setState({
                            gene: data.gene,
                            similar: data,
                            error: null
                        })
                    }
                }.bind(that),
                error: function(xhr, status, err) {
                    console.log(xhr)
                    if (this.isMounted() && task.name !== 'similar') {
                        if (err === 'Not Found') {
                            this.setState({
                                error: 'Gene ' + geneId + ' not found',
                                errorTitle: 'Error ' + xhr.status
                            })
                        } else {
                            this.setState({
                                error: 'Please try again later (' + xhr.status + ')',
                                errorTitle: 'Error ' + xhr.status
                            })
                        }
                    }
                }.bind(that)
            })
        })
    },
    
    componentDidMount: function() {

        this.loadData()
    },
    
    componentWillUnmount: function() {
    },

    componentWillReceiveProps: function(nextProps) {
        
        this.loadData(nextProps.params.geneId)
    },
    
    handleTopMenuClick: function(type) {
        
        Cookies.set('genetopmenu', type)
        this.setState({
            topMenuSelection: type
        })
    },

    handleDatabaseClick: function(db) {
        
        Cookies.set('genedb', db.id)
        this.setState({
            databaseSelection: db.id
        })
    },

    handleShowTypeClick: function(type) {
        
        Cookies.set('geneshowtype', type)
        this.setState({
            showTypeSelection: type
        })
    },

    download: function() {
        
        var form = document.getElementById('gn-gene-downloadform')
        form.submit()
    },
    
    render: function() {
        
        var content = null
        var contentTop = (
            <GeneHeader loading={true} />
        )
        var pageTitle = 'Loading' + GN.pageTitleSuffix
        
        if (this.state.error) {

            contentTop = (
                <GeneHeader notFound={this.props.params.geneId} />
            )
            pageTitle = this.state.errorTitle + GN.pageTitleSuffix
            
        } else {
            
            var data = this.state.topMenuSelection == 'prediction' ? this.state.prediction : this.state.similar
            if (data) {
                var tableContent = null
                if (this.state.topMenuSelection == 'prediction') {
                    tableContent = <DataTable data={data} db={this.state.databaseSelection} />
                } else if (this.state.topMenuSelection == 'similar') {
                    tableContent = <SimilarGenesTable data={data} />
                } else if (this.state.topMenuSelection == 'tissues') {
                    tableContent = <Tissues style={{paddingBottom: '100px'}} data={data} celltypes={this.state.celltypes}/>
                }
                pageTitle = data.gene.name + GN.pageTitleSuffix
                contentTop = (
                        <GeneHeader gene={data.gene} />
                )
                content = (
                        <div className={'gn-gene-container-outer'} style={{backgroundColor: color.colors.gnwhite, marginTop: '10px'}}>
                        <div className='gn-gene-container-inner maxwidth' style={{padding: '20px'}}>
                        <div>
                        <GeneMenu data={data}
                            onTopMenuClick={this.handleTopMenuClick}
                            onDatabaseClick={this.handleDatabaseClick}
                            onShowTypeClick={this.handleShowTypeClick}
                            topMenuSelection={this.state.topMenuSelection}
                            databaseSelection={this.state.databaseSelection}
                            showTypeSelection={this.state.showTypeSelection} />
                        {tableContent}
                        <DownloadPanel onClick={this.download} text='DOWNLOAD PREDICTIONS' />
                        </div>
                        </div>
                        <form id='gn-gene-downloadform' method='post' encType='multipart/form-data' action={GN.urls.tabdelim}>
                        <input type='hidden' id='geneId' name='geneId' value={data.gene.id} />
                        <input type='hidden' id='db' name='db' value={this.state.databaseSelection} />
                        <input type='hidden' id='what' name='what' value='geneprediction' />
                        <input type='hidden' id='tissues' name='tissues' value={_.toArray(Object.keys(this.state.celltypes.fixed.indices))} />
                        <input type='hidden' id='avg' name='avg' value={this.state.celltypes.values.avg} />
                        <input type='hidden' id='stdev' name='stdev' value={this.state.celltypes.values.stdev} />
                        <input type='hidden' id='z' name='z' value={this.state.celltypes.values.z} />
                        <input type='hidden' id='auc' name='auc' value={this.state.celltypes.values.auc} />
                        </form>
                        </div>
                )
            }
        }
        
        return (
                <DocumentTitle title={pageTitle}>
                <div className='flex10'>
                {contentTop}
                {content}
                </div>
                </DocumentTitle>
        )
    }
})

module.exports = Gene
