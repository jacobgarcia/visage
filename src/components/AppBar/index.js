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
  }

  toggleUserDataModal = (value) => () =>{
    this.setState(({ openUserModal }) => ({
      openUserModal: value === undefined ? !openUserModal : value,
    }))}

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
      },
      state: {
        openUserModal
      }
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
                  <div>
                    <TextField
                      label="RFC"
                      margin="normal"
                      variant="outlined"
                      value={data?.user?.username}
                      readOnly
                    />
                    <TextField
                      label="Razón social"
                      margin="normal"
                      variant="outlined"
                      value={data?.user?.username}
                      readOnly
                    />
                  </div>
                  <div>
                    <TextField
                      label="Código postal"
                      margin="normal"
                      variant="outlined"
                      value={data?.user?.username}
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
                <Typography variant="subtitle" color="inherit" noWrap>
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
                        <DayPicker
                          className="Selectable"
                          numberOfMonths={numberOfMonths}
                          selectedDays={[from, { from, to }]}
                          modifiers={modifiers}
                          onDayClick={handleDayClick}
                        />
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
              <div
                className="user-image"
                onClick={this.toggleUserDataModal(true)}
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

export default AppBarComponent
