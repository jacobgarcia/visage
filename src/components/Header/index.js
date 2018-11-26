import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import UsageBar from 'components/UsageBar'

import { UserContext } from 'utils/context'

function Header(props) {
  const isInDashboard = props.location.pathname === '/'

  return (
    <UserContext.Consumer>
      {(data) => (
        <header>
          <Link to={isInDashboard ? '/profile' : '/'}>
            <div className="user-container">
              <div>
                <div className="profile-icon" />
              </div>
              {isInDashboard ? (
                <div className="user-container--info">
                  <h3>{data?.user?.name}</h3>
                  <span>
                    {data?.user?.apiKey?.active ? 'Activo' : 'Inactivo'}
                  </span>
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
                <input type="text" value={data?.user?.apiKey?.value} readOnly />
              </div>
            </Fragment>
          )}
          <div />
        </header>
      )}
    </UserContext.Consumer>
  )
}

Header.propTypes = {}

export default Header
