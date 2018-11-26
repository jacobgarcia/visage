import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import UsageBar from '../../components/UsageBar'

function Header(props) {
  const isInDashboard = props.location.pathname === '/'
  return (
    <header>
      <Link to={isInDashboard ? '/profile' : '/'}>
        <div className="user-container">
          <div>
            <div className="profile-icon" />
          </div>
          {isInDashboard ? (
            <div className="user-container--info">
              <h3>Nombre Apellido</h3>
              <span>Activo</span>
            </div>
          ) : (
            <div>
              <span>Regresar a</span>
              <h3>Dashboard</h3>
            </div>
          )}
        </div>
      </Link>
      {isInDashboard && (
        <Fragment>
          <div className="usage-limit">
            <span>Límite de uso</span>
            <UsageBar percentage={32} />
          </div>
          <div>
            <span>Llave de API</span>
            <p>pbCI6Im1hcmlvQG51cmUubXgiLCJ1c2VybmFt</p>
          </div>{' '}
        </Fragment>
      )}
      <div />
    </header>
  )
}

Header.propTypes = {}

export default Header
