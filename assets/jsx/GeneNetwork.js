'use strict'

var DOMAIN = require('../../config/domain.js').domain

var _ = require('lodash')
var color = require('../js/color')
var htmlutil = require('./htmlutil')

var React = require('react')
var ReactDOM = require('react-dom')
var ReactRouter = require('react-router')
var Router = ReactRouter.Router
var Route = ReactRouter.Route
var Link = ReactRouter.Link
var createBrowserHistory = require('history/lib/createBrowserHistory')

var Select = require('react-select')

var Logo = require('./ReactComponents/Logo')
var API = require('./ReactComponents/API')
var Gene = require('./ReactComponents/Gene/Gene')
var Term = require('./ReactComponents/Term')
var Network = require('./ReactComponents/Network')
var Ontology = require('./ReactComponents/Ontology')
var DiagnosisMain = require('./ReactComponents/DiagnosisMain')
var Diagnosis = require('./ReactComponents/Diagnosis')
var Footer = require('./ReactComponents/Footer')

var GN = {}
window.GN = GN
GN.menuItems = [{
    name: 'HOME',
    route: '/'
}, {
    name: 'HOW IT WORKS',
    route: '/how'
}, {
    name: 'ABOUT',
    route: '/about'
}, {
    name: 'API',
    route: '/api'
}]

GN.urls = {

    main: DOMAIN,
    gene: DOMAIN + '/api/v1/gene',
    transcript: DOMAIN + '/api/v1/transcript',
    transcriptBars: DOMAIN + '/api/v1/transcriptBars',
    pathway: DOMAIN + '/api/v1/pathway',
    coregulation: DOMAIN + '/api/v1/coregulation',
    tissues: DOMAIN + '/api/v1/tissues',
    cofunction: DOMAIN + '/api/v1/cofunction',
    pc: DOMAIN + '/api/v1/pc',
    
    suggest: DOMAIN + '/socketapi/suggest',
    diagnosisSuggest: DOMAIN + '/socketapi/diagnosisSuggest',
    pathwayanalysis: DOMAIN + '/socketapi/pathwayanalysis',
    geneprediction: DOMAIN + '/socketapi/geneprediction',
    network: DOMAIN + '/socketapi/network',
    genescores: DOMAIN + '/socketapi/genescores',
    genevsnetwork: DOMAIN + '/socketapi/genevsnetwork',

    prioritization: DOMAIN + '/api/v1/prioritization',
    
    genePage: DOMAIN + '/gene/',
    termPage: DOMAIN + '/term/',
    networkPage: DOMAIN + '/network/',

    svg2pdf: DOMAIN + '/api/v1/svg2pdf',
    tabdelim: DOMAIN + '/api/v1/tabdelim',    
}

GN.pageTitleSuffix = ' - Gene Network'

var MenuBar = React.createClass({
    render: function() {
        var that = this
        var items = _.map(that.props.items, function(item, i) {
            // return (<Link key={item.name} className={'menuitem ' + (i === 0 ? 'first' : i === that.props.items.length - 1 ? 'last' : '')} to={item.route}>{item.name}</Link>)
            return (<Link key={item.name} className={'menuitem ' + (i === 0 ? 'first' : i === that.props.items.length - 1 ? 'last' : '')} to={item.route}>{item.name}</Link>)
        })
        return (<div className='gn-top-menubar noselect flex00 flexstart' style={this.props.style}>{items}</div>)
    }
})

var About = React.createClass({
    render: function() {
        return (<span>{'about'}</span>)
    }
})

var How = React.createClass({

    render: function() {

        return (
                <div>
                <div>TBA</div>
                </div>
        )
        return (
                <span>{'how'}</span>
        )
    }
})

var Api = React.createClass({
    render: function() {
        return (<API />)
    }
})

var GeneMain = React.createClass({
    render: function() {
        return (<div>perhaps gene list ?</div>)
    }
})

var Landing = React.createClass({

    mixins: [ReactRouter.History],

    getInitialState: function() {
        return {}
    },

    componentWillReceiveProps: function() {
    },

    componentDidMount: function() {
    },

    // TODO socket listener
    getSuggestions: function(input, callback) {
        if (!input || input.length < 2) {
            return callback(null, {})
        }
        var ts = new Date()
        io.socket.get(GN.urls.suggest,
                      {
                          q: input
                      },
                      function(res, jwres) {
                          var options = _.map(res, function(o) {
                              return {value: o.text, label: o.text}
                          })
                          console.debug('%d ms suggest: %d options', new Date() - ts, res.length)
                          callback(null, {options: options, complete: true})
                      })
        io.socket.on('suggestions', function(msg) {
            console.debug('%d ms socket suggest: %d options', new Date() - ts, msg.length)
        })
    },

    onSelectChange: function(value, options) {
        console.log('select ' + value)
    },

    onLogoClick: function() {
        this.history.pushState(null, '/')
    },
    
    render: function() {

        var topSearch = (<div className='flex11' />)
        var topBanner = null
        if (_.size(this.props.params) === 0) {
            if (this.props.location.pathname.indexOf('diagnosis') === 1) {
                topBanner = (null)
            } else {
                topBanner = (<div className='searchcontainer'>
                             <div className='searchheader noselect defaultcursor'>
                             Predict gene functions. Discover potential disease genes.
                             </div>
                             <div className='selectcontainer'>
                             <Select
                             name='search'
                             value={'Search here'}
                             matchPos='any'
                             matchProp='label'
                             placeholder=''
                             autoload={false}
                             asyncOptions={this.getSuggestions}
                             onChange={this.onSelectChange} />
                             </div>
                             <div className='examples noselect defaultcursor'>For example:&nbsp;
                             <Link className='clickable' title='MYOM1' to='/gene/MYOM1'>MYOM1</Link>,&nbsp;
                             <Link className='clickable' title='Interferon signaling' to='/term/REACTOME_INTERFERON_SIGNALING'>Interferon signaling</Link>,&nbsp;
                             <Link className='clickable' title='Schizophrenia' to='network' params={{ids: 'Schizophrenia'}}>Schizophrenia</Link>
                             </div>
                             </div>)
            }
        } else {
            topSearch = (<div className='gn-top-search flex11' style={{margin: '0 20px'}}>
                         <Select name='search' value={'Search here'}
                         matchProp='label' placeholder='' autoload={false} asyncOptions={this.getSuggestions} onChange={this.onSelectChange} />
                         </div>)
        }
        var that = this
        // 'Enter your search or paste a gene list here'
        return (<div className='gn-app vflex'>
                <div className='gn-top flex00 flexcenter hflex'>
                <div className='gn-top-logo clickable flex00' style={{margin: '10px 0'}} onClick={this.onLogoClick}>
                <Logo w={33} h={60} mirrored={true} style={{float: 'left', paddingRight: '10px'}} />
                <div className='noselect' style={{fontSize: '1.5em', color: color.colors.gndarkgray, float: 'left'}}>
                GENE<br/>NETWORK
                </div>
                </div>
                {topSearch}
                <MenuBar items={GN.menuItems} style={{backgroundColor: color.colors.gnverylightgray, padding: '20px'}} />
                </div>
                {topBanner}
                {this.props.children}
                {!this.props.children || this.props.children.props.route.path.indexOf('network') < 0 ? <Footer /> : null}
                </div>
        )
    }
})

var FormMixin = {
    handleSubmit: function(e) {
        e.preventDefault()
        var query = this.refs.query.getDOMNode().value.trim()
        console.log(e)
        if (query) {
            this.props.onQuerySubmit(query)
        }
    },
}

var SearchFormTextField = React.createClass({

    mixins: [FormMixin],

    render: function() {
        return (<form className='searchform' onSubmit={this.handleSubmit}>
                  <input type='text' placeholder={this.props.placeholder} ref='query' defaultValue=''></input>
                  <input type='submit' value='Go!'></input>
                </form>)
    }
})

var SearchFormTextArea = React.createClass({

    mixins: [FormMixin],

    render: function() {
        return (<form className='textareasearchform' onSubmit={this.handleSubmit}>
                <textarea id='manytextarea' placeholder={this.props.placeholder} ref='query' defaultValue={this.props.ids} />
                <div><input className='gobutton' type='submit' value='Go!' /></div>
                </form>)
    }
})

GN.routes = (

        <Route>
        <Route path='/' component = {Landing}>
        <Route path='/how' component = {How} />
        <Route path='/about' component = {About} />
        <Route path='/api' component = {Api} />
        <Route path='/gene/:geneId' component={Gene} />
        <Route path='/term/:termId' component = {Term} />
        <Route path='/network/:ids' component = {Network} />
        <Route path='/ontology/:id' component = {Ontology} />
        <Route path='/diagnosis' component = {DiagnosisMain} />
        <Route path='/diagnosis/:id' component = {Diagnosis} />
        </Route>
        </Route>
)

var history = createBrowserHistory()
ReactDOM.render(<Router history={history}>
                {GN.routes}
                </Router>,
                document.getElementById('reactcontainer')
               )
