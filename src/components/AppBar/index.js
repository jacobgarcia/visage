import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'

import { NavLink } from 'react-router-dom'

import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import TextField from '@material-ui/core/TextField'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import Modal from '@material-ui/core/Modal'
import DayPicker from 'react-day-picker'
import CircularProgress from '@material-ui/core/CircularProgress'
import ExitIcon from '@material-ui/icons/ExitToApp'
import Typography from '@material-ui/core/Typography'
import SaveIcon from '@material-ui/icons/Save'
import IconButton from '@material-ui/core/IconButton'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import NotificationsIcon from '@material-ui/icons/Notifications'
import Tooltip from '@material-ui/core/Tooltip'

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

class AppBarComponent extends PureComponent {
  state = {
    openUserModal: false,
    anchorEl: null,
  }

  toggleUserDataModal = (value) => () => {
    this.setState(({ openUserModal }) => ({
      openUserModal: value === undefined ? !openUserModal : value,
    }))
  }

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget })
  }

  handleClose = () => {
    this.setState({ anchorEl: null })
  }

  render() {
    const {
      props: {
        showSaveButton,
        showDateFilter,
        from,
        to,
        modifiers,
        title,
        toolBarHidden,
        showDayPicker,
        saving,
        onToggle,
        onSaveClicked,
        handleDayClick,
        numberOfMonths,
        isClient,
        closeProfileDrawer,
      },
      state: { openUserModal, anchorEl },
    } = this

    return (
      <UserContext.Consumer>
        {(data) => (
          <AppBar
            position="absolute"
            className={`app-bar ${toolBarHidden ? '--full-width' : ''}`}
          >
            <Modal
              open={openUserModal}
              onClose={this.toggleUserDataModal(false)}
              className="modal"
            >
              <div className="paper-container">
                <div className="paper">
                  <h3>Mi información</h3>
                  <div>
                    <TextField
                      label="Nombre"
                      margin="normal"
                      variant="outlined"
                      value={data?.user?.name}
                      readOnly
                    />
                  </div>
                  <div>
                    <TextField
                      label="Usuario"
                      margin="normal"
                      variant="outlined"
                      value={data?.user?.username}
                      readOnly
                    />
                  </div>
                  <div>
                    <TextField
                      label="Email"
                      margin="normal"
                      variant="outlined"
                      value={data?.user?.email}
                      readOnly
                    />
                  </div>
                  <NavLink to="/login" className="logot">
                    {listItem('Cerrar sesión', ExitIcon)}
                  </NavLink>
                </div>
              </div>
            </Modal>
            <Toolbar className="toolbar">
              <div className="toolbar__content">
                <Typography variant="subtitle1" color="inherit" noWrap>
                  {title}
                </Typography>

                <div className="toolbar__actions">
                  {showDateFilter && (
                    <div className="date-filter-container">
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={onToggle('showDayPicker')}
                        size="small"
                      >
                        Filtrar
                      </Button>
                      {showDayPicker && (
                        <div className="day-picker-container">
                          <DayPicker
                            className="Selectable"
                            numberOfMonths={numberOfMonths}
                            selectedDays={[from, { from, to }]}
                            modifiers={modifiers}
                            onDayClick={handleDayClick}
                          />
                          <div className="button-container">
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => {
                                this.props.onFilterRangeSet({ from, to })
                              }}
                            >
                              Mostrar
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {showSaveButton &&
                    (saving ? (
                      <div className="circular-progress-container">
                        <CircularProgress
                          className="circular-progress"
                          size={30}
                          color="secondary"
                        />
                      </div>
                    ) : (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={onSaveClicked}
                        size="small"
                      >
                        Guardar
                        <SaveIcon color="inherit" className="save-icon" />
                      </Button>
                    ))}
                </div>
              </div>
              {isClient && (
                <Tooltip
                  title={data?.user?.isIndexing ? 'Indexando' : 'Indexado'}
                  aria-label={data?.user?.isIndexing ? 'Indexando' : 'Indexado'}
                >
                  <div
                    className={`indexing-status ${
                      data?.user?.isIndexing ? '--indexing' : '--non-indexing'
                    }`}
                  />
                </Tooltip>
              )}
              {isClient && (
                <div className="actions-container">
                  <IconButton onClick={this.handleClick}>
                    <NotificationsIcon color="inherit" />
                  </IconButton>
                  <Menu
                    className="notification-menu"
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                  >
                    <div className="welcome-message">
                      <h6>Notificaciones</h6>
                      <div className="welcome-message__content">
                        <h3>Bienvenido</h3>
                      </div>
                    </div>
                  </Menu>
                </div>
              )}
              <div
                className="user-image"
                onClick={() => {
                  closeProfileDrawer
                    ? closeProfileDrawer()
                    : this.toggleUserDataModal(true)()
                }}
              >
                {data?.user?.userImage ? (
                  <img src={data?.user?.userImage} alt="User" />
                ) : (
                  <p>{data?.user?.name?.charAt(0)?.toUpperCase()}</p>
                )}
              </div>
            </Toolbar>
          </AppBar>
        )}
      </UserContext.Consumer>
    )
  }
}

AppBarComponent.defaultProps = {
  closeProfileDrawer: null,
}

export default AppBarComponent
