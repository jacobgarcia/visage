import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import DeleteIcon from '@material-ui/icons/Delete'
import PropTypes from 'prop-types'

import { withSaver } from '../../utils/portals'

import './styles.pcss'

class Tarifs extends Component {
  static propTypes = {
    saving: PropTypes.bool,
    stopSaving: PropTypes.function,
    toggle: PropTypes.function,
  }

  state = {
    consults: [0, 0, 0],
    imageIndexing: [0, 0],
  }

  componentDidMount() {
    this.props.toggle(true)
  }

  componentDidUpdate(prevProps) {
    if (this.props.saving && !prevProps.saving) {
      this.onSave()
    }
  }

  componentWillUnmount() {
    this.props.stopSaving(null)
  }

  onSave() {
    setTimeout(() => {
      this.props.stopSaving(true)
    }, 2000)
  }

  deleteItem = (element, index) => {
    this.setState((prevState) => ({
      [element]: prevState[element].filter((_, $0) => $0 !== index),
    }))
  }

  onAddItem = (element) => {
    this.setState((prevState) => ({
      [element]: prevState[element].concat([{}]),
    }))
  }

  render() {
    const {
      state: { consults, imageIndexing },
    } = this

    return (
      <div className="tarifs">
        <Card className="card">
          <div className="actions-container">
            <h3>Consultas</h3>
            <Button
              onClick={() => this.onAddItem('consults')}
              color="primary"
              className="button"
            >
              Nueva tarifa
            </Button>
          </div>

          {consults.map((_, index) => {
            return (
              <div className="row" key={index}>
                <div>
                  <TextField
                    id="standard-name"
                    label="Mínimo"
                    className="text-field"
                    value={''}
                    onChange={() => {}}
                    margin="normal"
                    variant="outlined"
                  />
                  <span className="dash">-</span>
                  <TextField
                    id="standard-name"
                    label="Máximo"
                    className="text-field"
                    value={''}
                    onChange={() => {}}
                    margin="normal"
                    variant="outlined"
                  />
                </div>
                <div>
                  <TextField
                    id="standard-name"
                    label="Costo"
                    className="text-field cost"
                    value={''}
                    onChange={() => {}}
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">MXN</InputAdornment>
                      ),
                    }}
                  />
                  <IconButton
                    onClick={() => this.deleteItem('consults', index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
            )
          })}
        </Card>
        <Card className="card">
          <div className="actions-container">
            <h3>Indexación de imágenes</h3>
            <Button
              onClick={() => this.onAddItem('imageIndexing')}
              color="primary"
              className="button"
            >
              Nueva tarifa
            </Button>
          </div>
          {imageIndexing.map((_, index) => {
            return (
              <div className="row" key={index}>
                <div>
                  <TextField
                    id="standard-name"
                    label="Mínimo"
                    className="text-field"
                    value={''}
                    onChange={() => {}}
                    margin="normal"
                    variant="outlined"
                  />
                  <span className="dash">-</span>
                  <TextField
                    id="standard-name"
                    label="Máximo"
                    className="text-field"
                    value={''}
                    onChange={() => {}}
                    margin="normal"
                    variant="outlined"
                  />
                </div>
                <div>
                  <TextField
                    id="standard-name"
                    label="Costo"
                    className="text-field cost"
                    value={''}
                    onChange={() => {}}
                    margin="normal"
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">MXN</InputAdornment>
                      ),
                    }}
                  />
                  <IconButton
                    onClick={() => this.deleteItem('imageIndexing', index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              </div>
            )
          })}
        </Card>
      </div>
    )
  }
}

export default withSaver(Tarifs)
