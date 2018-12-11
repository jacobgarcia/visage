import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NetworkOperation from 'utils/NetworkOperation'

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
import Card from 'components/Card'
import ProfileModal from 'components/ProfileModal'

import './styles.pcss'

class Dashboard extends Component {
  static propTypes = {}

  state = {
    profileModalOpen: false,
    billing: 0,
    products: {},
    searches: {},
    requests: {},
    topsearches: { mostSearchedItems: [] },
    chardata : [{name:'none', value:100}],
  }

  async componentDidMount() {
    try {
      let date = new Date()
      let to = date.getDay()
      date.setMonth(date.getMonth() - 1)
      let from = date.getDay()
      const {
        data: { user: data },
      } = await NetworkOperation.getSelf()
      const statsRes = await NetworkOperation.getClientRequestStats(
        data.username,
        from,
        to
      )
      const billingRes = await NetworkOperation.getClientBillingStats(
        data.username,
        from,
        to
      )
      const topsearches = await NetworkOperation.getTopSearches()
      const chardata = topsearches.data.mostSearchedItems.map((id, count) =>{
        console.log(id, count, 'holaaaaaa')
        return {name: id, value:count}
      })
      this.setState({
        billing: billingRes.data.billing,
        requests: statsRes.data.requests,
        topsearches: topsearches.data,
        chardata: chardata.length > 0 ? chardata : [{name:'none', value:100}],
      })
    } catch (error) {
      console.log(error)
    }
  }

  onToggleProfileModal = () => {
    this.setState(({ profileModalOpen }) => ({
      profileModalOpen: !profileModalOpen,
    }))
  }

  render() {
    const {
      props: { closeProfileDrawer },
    } = this

    return (
      <div className="dashboard">
        <Card>
          <h4>Resumen de consumo de datos</h4>
          <div className="chart-data-container">
            <div className="number">
              <h1>
                <span>$</span> {this.state.billing} <span>MXN</span>
              </h1>
            </div>
          </div>
        </Card>
        <Card>
          <h4>Cantidad de búsqueda</h4>
          <div className="chart-data-container">
            <div className="pie-chart-container">
              <PieChart width={420} height={420}>
                <Pie
                  data={this.state.chardata}
                  cx={200}
                  cy={200}
                  innerRadius={125}
                  outerRadius={200}
                  fill="#82ca9d"
                >
                  {this.state.chardata.map((data, index) => (
                    <Cell KEY={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
              <div className="pie-chart__label">
                <span>Total de búsquedas</span>
                <p>{this.state.requests.total}</p>
              </div>
            </div>
            <div className="pie-chart__legend">
              {this.state.chardata.map((data, index) => (
                <div key={index}>
                  <div
                    className="bullet"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span style={{ color: COLORS[index % COLORS.length] }}>
                    {data.name}
                  </span>
                  <span>{data.value}</span>
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
                Dentro del límite <span>1000</span>
              </p>
            </div>
            <UsageBar percentage={this.state.requests?.indexings} />
            <div className="usage-bar__data">
              <h5>Búsquedas</h5>
              <p className="high">
                Dentro del límite <span>1000</span>
              </p>
            </div>
            <UsageBar percentage={this.state.requests?.indexings} />
          </div>
        </Card>
        <Card noPadding>
          <h4>Productos más buscados</h4>
          <div className="table">
          <div key='title'>
            <div>Producto</div>
            <div>Categoría</div>
            <div>No. búsquedas</div>
          </div>
            {this.state.topsearches.mostSearchedItems.map((data, index) => (
              <div key={index}>
                <div>data.id</div>
                <div>data.cl</div>
                <div>data.count</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }
}

export default Dashboard
