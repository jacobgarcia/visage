import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import IconButton from '@material-ui/core/IconButton'
import InputAdornment from '@material-ui/core/InputAdornment'
import DeleteIcon from '@material-ui/icons/Delete'
import PropTypes from 'prop-types'

import NetworkOperation from 'utils/NetworkOperation'
import { withSaver } from 'utils/portals'

import './styles.pcss'

class Rates extends Component {
  static propTypes = {
    saving: PropTypes.bool,
    stopSaving: PropTypes.function,
    toggle: PropTypes.function,
  }

  state = {
    searchRates: [],
    indexRates: [],
  }

  async componentDidMount() {
    this.props.toggle({ saveButton: false })

    try {
      const { data } = await NetworkOperation.getRates()

      this.setState({
        indexRates: data.rates?.indexRates,
        searchRates: data.rates?.searchRates,
      })
    } catch (error) {
      console.log({ error })
    }
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

  onChange = () => {
    this.props.toggle({ saveButton: true })
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
      state: { searchRates, indexRates },
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

          {searchRates?.map((rate) => {
            return (
              <div className="row" key={rate._id}>
                <div>
                  <TextField
                    id="standard-name"
                    label="Mínimo"
                    className="text-field"
                    value={rate.min}
                    onChange={(evt) => this.onChange(evt, rate)}
                    margin="normal"
                    variant="outlined"
                  />
                  <span className="dash">-</span>
                  <TextField
                    id="standard-name"
                    label="Máximo"
                    className="text-field"
                    value={rate.max}
                    onChange={(evt) => this.onChange(evt, rate)}
                    margin="normal"
                    variant="outlined"
                  />
                </div>
                <div>
                  <TextField
                    id="standard-name"
                    label="Costo"
                    className="text-field cost"
                    value={rate.cost}
                    onChange={(evt) => this.onChange(evt, rate)}
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
                    onClick={() => this.deleteItem('consults', rate._id)}
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
          {indexRates?.map((rate) => {
            return (
              <div className="row" key={rate._id}>
                <div>
                  <TextField
                    id="standard-name"
                    label="Mínimo"
                    className="text-field"
                    value={rate.min}
                    onChange={() => {}}
                    margin="normal"
                    variant="outlined"
                  />
                  <span className="dash">-</span>
                  <TextField
                    id="standard-name"
                    label="Máximo"
                    className="text-field"
                    value={rate.max}
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
                    value={rate.cost}
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

export default withSaver(Rates)
