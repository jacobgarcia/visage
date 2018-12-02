import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import { NavLink } from 'react-router-dom'

import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import Drawer from '@material-ui/core/Drawer'
import ListItemText from '@material-ui/core/ListItemText'

import DashboardIcon from '@material-ui/icons/Dashboard'
import PeopleIcon from '@material-ui/icons/People'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'
import SecurityIcon from '@material-ui/icons/Security'
import ExitIcon from '@material-ui/icons/ExitToApp'
import PersonIcon from '@material-ui/icons/Person'

import qboLogo from 'assets/qbo-logo-mono.svg'
import { UserContext } from 'utils/context'

function listItem(text, Component) {
  return (
    <ListItem button>
      <ListItemIcon>
        <Component color="secondary" />
      </ListItemIcon>
      <ListItemText primary={text} />
    </ListItem>
  )
}

function DrawerComponent(props) {
  const { toolBarHidden, onToggle, onLinkClick, onCloseClick, isClient } = props

  return (
    <UserContext.Consumer>
      {(data) => {
        const services = data?.user?.services
        return (
          <Drawer
            className={`drawer ${toolBarHidden ? '--hidden' : ''}`}
            variant="permanent"
            anchor="left"
          >
            <div className={'toolbar__logo'}>
              <img src={qboLogo} alt="QBO" />
              <div
                onClick={onToggle('toolBarHidden')}
                className={'toggle-button'}
              />
            </div>
            {(services?.dashboard || isClient) && (
              <NavLink onClick={onLinkClick} exact to="/">
                {listItem('Dashboard', DashboardIcon)}
              </NavLink>
            )}
            {isClient && (
              <NavLink onClick={onLinkClick} exact to="/profile">
                {listItem('Mi información', PersonIcon)}
              </NavLink>
            )}
            {!isClient && (
              <Fragment>
                {services?.clients !== 0 && (
                  <NavLink onClick={onLinkClick} to="/clients">
                    {listItem('Clientes', PeopleIcon)}
                  </NavLink>
                )}
                {services?.admins !== 0 && (
                  <NavLink onClick={onLinkClick} to="/admins">
                    {listItem('Administradores', SecurityIcon)}
                  </NavLink>
                )}

                <NavLink onClick={onLinkClick} to="/rates">
                  {listItem('Tarifas', AttachMoneyIcon)}
                </NavLink>
              </Fragment>
            )}

            <NavLink onClick={onCloseClick} to="/login" className="login">
              {listItem('Cerrar sesión', ExitIcon)}
            </NavLink>
          </Drawer>
        )
      }}
    </UserContext.Consumer>
  )
}

DrawerComponent.propTypes = {}

DrawerComponent.defaultProps = {
  isClient: false,
}

export default DrawerComponent
