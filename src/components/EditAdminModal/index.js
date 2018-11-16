import React from 'react'
import PropTypes from 'prop-types'

import Modal from '@material-ui/core/Modal'
import TextField from '@material-ui/core/TextField'
import Switch from '@material-ui/core/Switch'
import Button from '@material-ui/core/Button'
import Radio from '@material-ui/core/Radio'

import './styles.pcss'

function EditAdminModal(props) {
  return (
    <div>
      <Modal
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        open={props.open}
        onClose={props.onClose}
        className="modal"
      >
        <div className="paper-container">
          <div className="paper">
            <h4>Editar administrador</h4>
            <div>
              <TextField
                required
                label="Nombre del administrador"
                margin="normal"
                variant="outlined"
              />
              <TextField
                required
                label="Email"
                margin="normal"
                variant="outlined"
              />
            </div>
            <div>
              <div className="radio-inputs-container">
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Administrador</label>
                </div>
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Super administrador</label>
                </div>
              </div>
            </div>
            <hr />
            <div className="permits-container">
              <h5>Permisos</h5>
              <h6>Dashboard</h6>
              <div className="radio-inputs-container">
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Con acceso</label>
                </div>
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Sin acceso</label>
                </div>
              </div>
              <hr />
              <h6>Clientes</h6>
              <div className="radio-inputs-container">
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Ver y editar</label>
                </div>
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Sólo ver</label>
                </div>
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Sin acceso</label>
                </div>
              </div>
              <hr />
              <h6>Administradores</h6>
              <div className="radio-inputs-container">
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Ver y editar</label>
                </div>
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Sólo ver</label>
                </div>
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Sin acceso</label>
                </div>
              </div>
              <hr />
              <h6>Tarifas</h6>
              <div className="radio-inputs-container">
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Ver y editar</label>
                </div>
                <div>
                  <Radio checked={true} />
                  <label htmlFor="">Sólo ver</label>
                </div>
              </div>
            </div>
            <Button
              onClick={props.onClose}
              variant="contained"
              color="secondary"
            >
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

EditAdminModal.propTypes = {}

const SimpleModalWrapped = EditAdminModal

export default SimpleModalWrapped
