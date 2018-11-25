import React from 'react'
import PropTypes from 'prop-types'

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import DayPicker from 'react-day-picker'
import CircularProgress from '@material-ui/core/CircularProgress'
import Typography from '@material-ui/core/Typography'
import SaveIcon from '@material-ui/icons/Save'

import { UserContext } from 'utils/context'

function AppBarComponent(props) {
  const {
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
  } = props

  return (
    <UserContext.Consumer>
      {(data) => (
        <AppBar
          position="absolute"
          className={`app-bar ${toolBarHidden ? '--full-width' : ''}`}
        >
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
                        color="inherit"
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
            <div>
              <div className="user-image">
                {data?.user?.userImage ? (
                  <img src={data?.user?.userImage} alt="User" />
                ) : (
                  <p>{data?.user?.name.charAt(0).toUpperCase()}</p>
                )}
              </div>
            </div>
          </Toolbar>
        </AppBar>
      )}
    </UserContext.Consumer>
  )
}

export default AppBarComponent
