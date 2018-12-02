import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import './style.pcss'
import qboLogo from 'assets/qbo-logo.svg'

class NotFound extends Component {
  static propTypes = {}

  state = {}

  render() {
    return (
      <div className="not-found">
        <div className="message-container">
          <img src={qboLogo} alt="" />
          <h2 className="not-found__header">No encontrado</h2>
          <p>La página que estás buscando no existe</p>
          <div className="reload">
            <Link to="/">Regresar</Link>
          </div>
        </div>
      </div>
    )
  }
}

export default NotFound
