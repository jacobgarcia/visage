import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#242424']
const data02 = [
  { name: 'A1', value: 100 },
  { name: 'A2', value: 300 },
  { name: 'B1', value: 100 },
  { name: 'B2', value: 80 },
  { name: 'B3', value: 40 },
]
import UsageBar from 'components/UsageBar'
import Header from 'components/Header'
import Card from 'components/Card'
import ProfileModal from 'components/ProfileModal'

import './styles.pcss'

class Dashboard extends Component {
  static propTypes = {}

  state = {
    profileModalOpen: false,
  }

  onToggleProfileModal = () => {
    this.setState(({ profileModalOpen }) => ({
      profileModalOpen: !profileModalOpen,
    }))
  }

  onLogout = () => {
    this.props.history.replace('/login')
  }

  render() {
    const {
      state: { profileModalOpen },
    } = this

    return (
      <div id="client-app">
        <Header
          onUserModalOpen={this.onToggleProfileModal}
          location={this.props.location}
        />
        <div className="dashboard">
          <ProfileModal
            open={profileModalOpen}
            onLogout={this.onLogout}
            onClose={this.onToggleProfileModal}
          />
          <Card>
            <h4>Resumen de consumo de datos</h4>
          </Card>
          <Card>
            <h4>Cantidad de búsqueda</h4>
            <div className="chart-data-container">
              <div className="pie-chart-container">
                <PieChart width={210} height={210}>
                  <Pie
                    data={data02}
                    cx={100}
                    cy={100}
                    innerRadius={75}
                    outerRadius={100}
                    fill="#82ca9d"
                  >
                    {data02.map((entry, index) => (
                      <Cell KEY={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="pie-chart__label">
                  <span>Total de búsquedas</span>
                  <p>74,662</p>
                </div>
              </div>
              <div className="pie-chart__legend">
                {[0, 0, 0, 0, 0].map((_, index) => (
                  <div key={index}>
                    <div
                      className="bullet"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span style={{ color: COLORS[index % COLORS.length] }}>
                      35%
                    </span>
                    <p>Tag</p>
                    <span>18200</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card>
            <h4>Consumo de datos</h4>
            <div>
              <div className="usage-bar__data">
                <h5>Indexaciones</h5>
                <p className="low">
                  Dentro del límite <span>7849</span>
                </p>
              </div>
              <UsageBar percentage={32} />
              <div className="usage-bar__data">
                <h5>Búsquedas</h5>
                <p className="high">
                  Dentro del límite <span>7849</span>
                </p>
              </div>
              <UsageBar percentage={76} />
            </div>
          </Card>
          <Card noPadding>
            <h4>Productos más buscados</h4>
            <div className="table">
              {[0, 0, 0, 0, 0, 0].map((_, index) => (
                <div key={index}>
                  <div>Producto</div>
                  <div>Categoría</div>
                  <div>No. búsquedas</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }
}

export default Dashboard
