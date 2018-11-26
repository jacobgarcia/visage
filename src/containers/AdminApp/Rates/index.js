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

function parseRates($0) {
  const { _id, ...rate } = $0

  if ((/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i).test(_id)) {
    return {
      min: parseFloat(rate.min),
      max: parseFloat(rate.max),
      cost: parseFloat(rate.cost),
      _id,
    }
  }
  return {
    min: parseFloat(rate.min),
    max: parseFloat(rate.max),
    cost: parseFloat(rate.cost),
  }
}

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
    this.props.setSaveFunction(this.onSave)

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

  onSave = async () => {
    const rates = {
      searchRates: this.state.searchRates.map(parseRates),
      indexRates: this.state.indexRates.map(parseRates),
    }

    console.log(rates)

    try {
      const response = await NetworkOperation.setRates(rates)

      console.log({ response })

      this.props.stopSaving({ success: true })
    } catch (error) {
      console.error(error)
      this.props.stopSaving({ success: false })
    }
  }

  onChange = ({ target: { name, value } }, rate, field) => {
    this.props.toggle({ [name]: value, saveButton: true })

    if (rate && field) {
      if (field === 'searchRates') {
        this.setState((prev) => ({
          searchRates: prev.searchRates.map(($0) =>
            $0._id === rate._id ? { ...$0, [name]: value } : $0
          ),
        }))
        return
      }

      this.setState((prev) => ({
        searchRates: prev.searchRates.map(($0) =>
          $0._id === rate._id ? { ...$0, [name]: value } : $0
        ),
      }))
    }
  }

  deleteItem = (element, rateId) => {
    this.props.toggle({ saveButton: true })
    this.setState((prevState) => ({
      [element]: prevState[element].filter(({ _id }) => _id !== rateId),
    }))
  }

  onAddItem = (element) => {
    this.props.toggle({ saveButton: true })
    this.setState((prevState) => ({
      [element]: prevState[element].concat([{ _id: String(Date.now()) }]),
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
              onClick={() => this.onAddItem('searchRates')}
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
                    onChange={(evt) => this.onChange(evt, rate, 'searchRates')}
                    margin="normal"
                    name="min"
                    variant="outlined"
                  />
                  <span className="dash">-</span>
                  <TextField
                    id="standard-name"
                    label="Máximo"
                    className="text-field"
                    value={rate.max}
                    onChange={(evt) => this.onChange(evt, rate, 'searchRates')}
                    margin="normal"
                    name="max"
                    variant="outlined"
                  />
                </div>
                <div>
                  <TextField
                    id="standard-name"
                    label="Costo"
                    className="text-field cost"
                    value={rate.cost}
                    onChange={(evt) => this.onChange(evt, rate, 'searchRates')}
                    margin="normal"
                    name="cost"
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
                    onClick={() => this.deleteItem('searchRates', rate._id)}
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
              onClick={() => this.onAddItem('indexRates')}
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
                    onChange={(evt) => this.onChange(evt, rate, 'indexRates')}
                    margin="normal"
                    variant="outlined"
                  />
                  <span className="dash">-</span>
                  <TextField
                    id="standard-name"
                    label="Máximo"
                    className="text-field"
                    value={rate.max}
                    onChange={(evt) => this.onChange(evt, rate, 'indexRates')}
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
                    onChange={(evt) => this.onChange(evt, rate, 'indexRates')}
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
                    onClick={() => this.deleteItem('indexRates', rate._id)}
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
