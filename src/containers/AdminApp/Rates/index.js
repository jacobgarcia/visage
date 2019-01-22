import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Card from '@material-ui/core/Card'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import InputAdornment from '@material-ui/core/InputAdornment'
import DeleteIcon from '@material-ui/icons/Delete'
import PropTypes from 'prop-types'

import SnackMessage from 'components/SnackMessage'
import NetworkOperation from 'utils/NetworkOperation'
import { withSaver } from 'utils/portals'
import { UserContext } from 'utils/context'

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

  static contextType = UserContext

  state = {
    searchRates: [],
    indexRates: [],
    message: null,
    forSave: false,
  }

  async componentDidMount() {
    this.props.toggle({ saveButton: false })
    this.setState({ forSave: false })
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

    let hasError = false
    rates.searchRates.reduce((prev, current) => {
      if (prev.max >= current.min) {
        this.setState({
          message:
            'Error en los límites de las tarifas, verifica que no haya superposiciones',
        })
        hasError = true
      }
      return current
    }, {})

    if (hasError) {
      this.props.stopSaving({ success: true })
      return
    }

    if (window.confirm('¿Estás seguro de modificar las tarifas?')) {
      try {
        await NetworkOperation.setRates(rates)

        this.setState({ message: 'Cambios guardados', forSave: false })

        this.props.stopSaving({ success: true })
      } catch (error) {
        console.error(error)
        this.props.stopSaving({ success: false })
        this.setState({
          message: 'Error al guardar cambios, verificar la información',
        })
      }
    } else {
      this.props.stopSaving({ success: true })
    }
  }

  onChange = ({ target: { name, value } }, rate, field) => {
    this.props.toggle({ [name]: value, saveButton: true })
    this.setState({ forSave: true })
    // These lines follow Cesar's enigmatic paradigm,
    // it just updates rates values and uses RETURN as an ELSE.
    if (rate && field) {
      if (field === 'searchRates') {
        this.setState((prev) => ({
          searchRates: prev.searchRates.map(($0) =>
            $0._id === rate._id ? { ...$0, [name]: value } : $0
          ),
        }))
      } else {
        this.setState((prev) => ({
          indexRates: prev.indexRates.map(($0) =>
            $0._id === rate._id ? { ...$0, [name]: value } : $0
          ),
        }))
      }
    }
  }

  deleteItem = async (element, rateId) => {
    if (!this.state.forSave) {
      this.setState((prevState) => ({
        [element]: prevState[element].filter(({ _id }) => _id !== rateId),
      }))
      await this.onSave()
    } else {
      this.setState({ message: 'Primero Guarde los cambios realizados' })
    }
  }

  onAddItem = (element) => {
    this.props.toggle({ saveButton: true })
    this.setState({ forSave: true })

    this.setState((prevState) => ({
      [element]: prevState[element] ? prevState[element].concat([{ _id: String(Date.now()) }]) : [{ _id: String(Date.now()) }],
    }))
  }

  onCloseSnack = () => this.setState({ message: null })

  render() {
    const {
      state: { searchRates, indexRates, message },
    } = this

    const canEdit = this.context?.user?.services?.rates === true

    return (
      <div className="tarifs">
        <SnackMessage
          open={message}
          message={message}
          onClose={this.onCloseSnack}
        />
        <Card className="card">
          <div className="actions-container">
            <Typography variant="h5">Consultas</Typography>
            {canEdit && (
              <Button
                onClick={() => this.onAddItem('searchRates')}
                color="primary"
                className="button"
              >
                Nueva tarifa
              </Button>
            )}
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
                    onChange={(evt) =>
                      canEdit && this.onChange(evt, rate, 'searchRates')
                    }
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
                    onChange={(evt) =>
                      canEdit && this.onChange(evt, rate, 'searchRates')
                    }
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
                    onChange={(evt) =>
                      canEdit && this.onChange(evt, rate, 'searchRates')
                    }
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
                  {canEdit && (
                    <IconButton
                      onClick={() => this.deleteItem('searchRates', rate._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </div>
              </div>
            )
          })}
        </Card>
        <Card className="card">
          <div className="actions-container">
            <Typography variant="h5">Indexación de imagenes</Typography>
            {canEdit && (
              <Button
                onClick={() => this.onAddItem('indexRates')}
                color="primary"
                className="button"
              >
                Nueva tarifa
              </Button>
            )}
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
                    onChange={(evt) =>
                      canEdit && this.onChange(evt, rate, 'indexRates')
                    }
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
                    onChange={(evt) =>
                      canEdit && this.onChange(evt, rate, 'indexRates')
                    }
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
                    onChange={(evt) =>
                      canEdit && this.onChange(evt, rate, 'indexRates')
                    }
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
                  {canEdit && (
                    <IconButton
                      onClick={() => this.deleteItem('indexRates', rate._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
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
