import React from 'react'
import PropTypes from 'prop-types'

import qboLogo from 'assets/qbo-logo-mono.svg'

import { UserContext } from 'utils/context'

function Header(props) {
  return (
    <UserContext.Consumer>
      {(data) => (
        <header>
          <div className="logo-container">
            <img src={qboLogo} alt="" />
          </div>
          <div className="header-content">
            <h3>Dashboard</h3>
            <div
              onClick={props.onUserModalOpen}
              className="user-container--info"
            >
              <p>{data?.user?.name.charAt(0)}</p>
            </div>
          </div>
        </header>
      )}
    </UserContext.Consumer>
  )
}

Header.propTypes = {}

export default Header
