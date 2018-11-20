import React, { Component, Fragment } from 'react'
import { NavLink, Switch, Route } from 'react-router-dom'
import PropTypes from 'prop-types'
import DayPicker, { DateUtils } from 'react-day-picker'
import 'react-day-picker/lib/style.css';

import CssBaseline from '@material-ui/core/CssBaseline'
import Drawer from '@material-ui/core/Drawer'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import DashboardIcon from '@material-ui/icons/Dashboard'
import SaveIcon from '@material-ui/icons/Save'
import PeopleIcon from '@material-ui/icons/People'
import AttachMoneyIcon from '@material-ui/icons/AttachMoney'
import SecurityIcon from '@material-ui/icons/Security'
import ExitIcon from '@material-ui/icons/ExitToApp'

import Dashboard from '../Dashboard'
import Clients from '../Clients'
import Admins from '../Admins'
import Tarifs from '../Tarifs'

import { SaverProvider } from '../../utils/portals'

import qboLogoColor from '../../assets/qbo-logo.svg'
import qboLogo from '../../assets/qbo-logo-mono.svg'
import './styles.pcss'

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

class App extends Component {
  static propTypes = {
    location: PropTypes.object,
  }

  state = {
    loadingSelf: true,
    open: false,
    showSaveButton: false,
    saving: false,
    toolBarHidden: false,
    showDateFilter: true,
    showDayPicker: false,
    ...this.getInitialState()
  }

  async componentDidMount() {
    try {
      const data = await NetworkOperation.getSelf()

      // Set data to display in nav
      this.setState({ loadingSelf: false })
    } catch(error) {
      // Check if we've got a 403 to replace to login. Other error should
      // be displayed
      this.props.history.replace('/login')
    }
  }

  onDrawerToggle = () => this.setState(({ open }) => ({ open: !open }))

  handleDrawerClose = () => this.setState({ open: false })

  onLinkClick = () => this.setState({ open: false })

  setSaveButtonValue = (value = false) => {
    this.setState({ showSaveButton: value })
  }

  onSaveClicked = () => this.setState({ saving: true })

  setStopSaving = () => this.setState({ saving: false })

  onToggleToolBar = () => {
    this.setState(({ toolBarHidden })=> ({ toolBarHidden: !toolBarHidden }))
  }

  onToggleDayPicker = () => this.setState(({showDayPicker}) => ({showDayPicker: !showDayPicker}))

  onDateSelect = () => {

  }

  getInitialState() {
    return {
      from: undefined,
      to: undefined,
    };
  }

  handleDayClick = (day) => {
    const range = DateUtils.addDayToRange(day, this.state);
    this.setState(range);
  }

  handleResetClick = () => {
    this.setState(this.getInitialState());
  }

  render() {
    const {
      state: { open, showSaveButton, saving, toolBarHidden, showDateFilter, showDayPicker,loadingSelf },
      props: {
        location: { pathname },
      },
    } = this

    if (loadingSelf) {
      return (
        <div className="loading-screen">
          <img src={qboLogoColor} alt="QBO"/>
          <p>Cargando...</p>
        </div>
      )
    }

    let title = ''
    if (pathname === '/') title = 'Dashboard'
    if (pathname === '/clients') title = 'Clientes'
    if (pathname === '/admins') title = 'Administradores'
    if (pathname === '/tarifs') title = 'Tarifas'

    const { from, to } = this.state
    const modifiers = { start: from, end: to }

    return (
      <SaverProvider
        value={{
          toggle: this.setSaveButtonValue,
          value: showSaveButton,
          saving,
          stopSaving: this.setStopSaving,
          showDateFilter,
          onDateSelect: this.onDateSelect
        }}
      >
        <Fragment>
          <CssBaseline />
          <div className="root">
            <AppBar position="absolute" className={`app-bar ${toolBarHidden ? '--full-width' : ''}`}>
              <Toolbar className="toolbar">
                <div className="toolbar__content">
                  <Typography variant="subtitle" color="inherit" noWrap>
                    {title}
                  </Typography>

                  <div className="toolbar__actions">
                    {
                      showDateFilter && (
                        <div className="date-filter-container">
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={this.onToggleDayPicker}
                            size="small"
                            >
                            Filtrar
                          </Button>
                          { showDayPicker &&
                            <DayPicker
                              className="Selectable"
                              numberOfMonths={this.props.numberOfMonths}
                              selectedDays={[from, { from, to }]}
                              modifiers={modifiers}
                              onDayClick={this.handleDayClick}
                            />
                          }
                        </div>

                      )
                    }
                    {showSaveButton &&
                      (saving ? (
                        <div className="circular-progress-container">
                          <CircularProgress
                            className="circular-progress"
                            size={30}
                            color="inherit"
                          />
                        </div>
                      ) : (
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={this.onSaveClicked}
                          size="small"
                        >
                          Guardar
                          <SaveIcon color="inherit" className="save-icon" />
                        </Button>
                      ))}
                  </div>
                </div>
                <div>
                  <div className="user-image" />
                </div>
              </Toolbar>
            </AppBar>
            <Drawer
              className={`drawer ${toolBarHidden ? '--hidden' : ''}`}
              variant="permanent"
              anchor="left"
            >
              <div className={`toolbar__logo`}>
                <img src={qboLogo} alt="QBO" />
                <div onClick={this.onToggleToolBar} className={`toggle-button`} />
              </div>
              <NavLink onClick={this.onLinkClick} exact to="/">
                {listItem('Dashboard', DashboardIcon)}
              </NavLink>
              <NavLink onClick={this.onLinkClick} to="/clients">
                {listItem('Clientes', PeopleIcon)}
              </NavLink>
              <NavLink onClick={this.onLinkClick} to="/admins">
                {listItem('Administradores', SecurityIcon)}
              </NavLink>
              <NavLink onClick={this.onLinkClick} to="/tarifs">
                {listItem('Tarifas', AttachMoneyIcon)}
              </NavLink>
              <NavLink onClick={this.onLinkClick} to="/login" className="login">
                {listItem('Cerrar sesión', ExitIcon)}
              </NavLink>
            </Drawer>
            <main className={`content ${toolBarHidden ? '--full-width' : ''}`}>
              <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route exact path="/clients" component={Clients} />
                <Route exact path="/admins" component={Admins} />
                <Route exact path="/tarifs" component={Tarifs} />
              </Switch>
            </main>
          </div>
        </Fragment>
      </SaverProvider>
    )
  }
}

App.propTypes = {}

export default App
