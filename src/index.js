import React from 'react'
import ReactDOM from 'react-dom'
import fetchJsonp from 'fetch-jsonp'
import { Action, withStatechart } from 'react-automata'
import 'normalize.css'
import './style.css'

const statechart = {
  initial: 'start',
  states: {
    start: {
      on: {
        SEARCH: 'loading',
      },
    },
    loading: {
      on: {
        SEARCH_SUCCESS: 'gallery',
        SEARCH_FAILURE: 'error',
        CANCEL_SEARCH: 'gallery',
      },
      onEntry: 'enterLoading',
      onExit: 'exitLoading',
    },
    error: {
      on: {
        SEARCH: 'loading',
      },
      onEntry: 'enterError',
    },
    gallery: {
      on: {
        SEARCH: 'loading',
        SELECT_PHOTO: 'photo',
      },
      onEntry: 'enterGallery',
    },
    photo: {
      on: {
        EXIT_PHOTO: 'gallery',
      },
      onEntry: 'enterPhoto',
    },
  },
}

class Gallery extends React.Component {
  state = {
    disableForm: false,
    query: '',
    searchText: 'Search',
  }

  enterLoading() {
    this.setState({
      disableForm: true,
      searchText: 'Searching...',
    })

    const encodedQuery = encodeURIComponent(this.state.query)
    setTimeout(() => {
      fetchJsonp(
        `https://api.flickr.com/services/feeds/photos_public.gne?lang=en-us&format=json&tags=${encodedQuery}`,
        { jsonpCallback: 'jsoncallback' }
      )
        .then(res => res.json())
        .then(({ items }) => this.props.transition('SEARCH_SUCCESS', { items }))
        .catch(() => this.props.transition('SEARCH_FAILURE'))
    }, 10)
  }

  exitLoading() {
    this.setState({
      disableForm: false,
      searchText: 'Search',
    })
  }

  enterError() {
    this.setState({
      searchText: 'Try search again',
    })
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.transition('SEARCH')
  }

  handleChangeQuery = e => {
    this.setState({ query: e.target.value })
  }

  render() {
    return (
      <div className="ui-app" data-state={this.props.machineState}>
        <div className="logoinline">
          <div>
              <img class="myLogo" alt="" src="https://spennyapp.com/static/media/logo_white.e228ed4d.svg"/>
          </div>

          <div class="logotext">
              <h1>Frontend Assignment ~ Image Grid</h1>  
          </div>
        </div>
        <form className="ui-search" onSubmit={this.handleSubmit}>
          <input
            className="ui-input"
            disabled={this.state.disableForm}
            placeholder="Search free high resolution photos "
            type="search"
            value={this.state.query}
            onChange={this.handleChangeQuery}
          />
          <div className="ui-buttons">
            <button className="ui-button" disabled={this.state.disableForm}>
              {this.state.searchText}
            </button>
            <Action show="enterLoading">
              <button
                className="ui-button"
                type="button"
                onClick={() => this.props.transition('CANCEL_SEARCH')}
              >
                Cancel
              </button>
            </Action>
          </div>
        </form>

        <section className="ui-items">
          <Action show="enterError">
            <span className="ui-error">Uh oh, search failed.</span>
          </Action>
          {this.props.items.map((item, i) => (
            <img
              className="ui-item"
              key={item.link}
              src={item.media.m}
              alt=""
              style={{ '--i': i }}
              onClick={() =>
                this.props.transition('SELECT_PHOTO', { photo: item })}
            />
          ))}
          
        </section>
        
        <Action show="enterPhoto">
          <section
            className="ui-photo-detail"
            onClick={() => this.props.transition('EXIT_PHOTO')}
          >
            <img className="ui-photo" alt="" src={this.props.photo.media.m} />
          
          </section>
          
        </Action>
        <div class="logotext">
              <h1>Submitted by - Anil chouhan</h1>  
          </div>
      </div>
    )
  }
}

const initialData = {
  items: [],
  photo: {
    media: {},
  },
}

const App = withStatechart(statechart, { initialData })(Gallery)

ReactDOM.render(<App />, document.getElementById('root'))
