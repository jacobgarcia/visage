import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Modal from '@material-ui/core/Modal'
import TextInput from 'components/TextInput'
import './styles.pcss'

import { UserContext } from 'utils/context'

class ProfileModal extends Component {
  static propTypes = {}

  static contextType = UserContext

  state = {
    name: this.context?.user?.name,
    company: this.context?.user?.company,
    email: this.context?.user?.email,
    username: this.context?.user?.username,
  }

  onChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value })
  }

  render() {
    const {
      state: { name, company, email, username },
    } = this

    return (
      <Modal
        open={this.props.open}
        onClose={this.props.onClose}
        className="modal"
      />
    )
  }
}

export default ProfileModal
