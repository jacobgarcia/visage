import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import NetworkOperation from 'utils/NetworkOperation'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = [
  '#BCD1E0',
  '#F4DCDC',
  '#BCD1E0',
  '#98B1CE',
  '#F9CC7A',
  '#E9666E',
]

import UsageBar from 'components/UsageBar'
import Card from 'components/Card'
// import ProfileModal from 'components/ProfileModal'

import './styles.pcss'

class Dashboard extends Component {
  static propTypes = {}

  state = {
    profileModalOpen: false,
    billing: 0,
    products: {},
    searches: {},
    requests: {},
    searchLimit: 1000,
    indexLimit: 1000,
    topsearches: { mostSearchedItems: [] },
    chardata: [{ name: 'none', value: 100 }],
  }

  async componentDidMount() {
    try {
      const date = new Date()
      const to = date.getTime()
      date.setMonth(date.getMonth() - 1)
      const from = date.getTime()
      const {
        data: { user: data },
      } = await NetworkOperation.getSelf()

      const statsRes = await NetworkOperation.getClientRequestStats(
        data?.username,
        from,
        to
      )
      const billingRes = await NetworkOperation.getClientBillingStats(
        data?.username,
        from,
        to
      )
      const topsearches = await NetworkOperation.getTopSearches()
      const chardata = topsearches?.data?.mostSearchedItems.map(
        (data) => {
          return { name: data.id, value: data.count }
        }
      )

      this.setState({
        billing: billingRes.data.billing,
        requests: statsRes.data.requests,
        topsearches: topsearches.data,
        chardata:
          chardata.length > 0 ? chardata : [{ name: 'none', value: 100 }],
        searchLimit: data.searchLimit,
        indexLimit: data.indexLimit,
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
          <Typography variant="h6">Resumen de consumo de datos</Typography>
          <div className="chart-data-container">
            <div className="number">
              <Typography variant="h1">
                <span>$</span> {this.state.billing} <span>MXN</span>
              </Typography>
            </div>
          </div>
        </Card>
        <Card>
          <Typography variant="h6">Búsquedas e indexaciones</Typography>
          <div className="chart-data-container">
            <div className="pie-chart-container">
              <ResponsiveContainer width="50%" height={300}>
                <PieChart>
                  <Pie
                    data={this.state.chardata}
                    innerRadius="60%"
                    fill="#82ca9d"
                    dataKey="value"
                    label
                  >
                    {this.state.chardata.map((data, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Pie
                    data={this.state.chardata}
                    innerRadius="30%"
                    outerRadius="50%"
                    fill="#82ca9d"
                    dataKey="value"
                    label
                  >
                    {this.state.chardata.map((data, index) => (
                      <Cell key={index} fill={COLORS[(index % COLORS.length) + 3]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-chart-info">
                <div className="pie-chart-info-totals">
                  <div className="pie-chart__label">
                    <Typography variant="h6">Total de búsquedas</Typography>
                    <Typography variant="h4">
                      {this.state.requests.total}
                    </Typography>
                  </div>
                  <div className="pie-chart__label">
                    <Typography variant="h6">Total de indexaciones</Typography>
                    <Typography variant="h4">
                      {this.state.requests.total}
                    </Typography>
                  </div>
                </div>
                <div className="pie-chart__legend">
                  {this.state.chardata.map((data, index) => (
                    <div key={index}>
                      <div
                        className="bullet"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <Typography
                        variant="body"
                        style={{ color: COLORS[index % COLORS.length] }}
                      >
                        ID: {data.name}
                      </Typography>
                      <Typography variant="body">
                        Cantidad: {data.value}
                      </Typography>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <Typography variant="h6">Consumo de datos</Typography>
          <div>
            <div className="usage-bar__data">
              <Typography variant="body">Indexaciones</Typography>
              <Typography variant="caption" className="low">
                Dentro del límite <span>{this.state.indexLimit}</span>
              </Typography>
            </div>
            <UsageBar
              percentage={
                (this.state.requests?.indexings / this.state.indexLimit) * 100
              }
            />
            <div className="usage-bar__data">
              <Typography variant="body">Búsquedas</Typography>
              <Typography variant="caption" className="high">
                Dentro del límite <span>{this.state.searchLimit}</span>
              </Typography>
            </div>
            <UsageBar
              percentage={
                (this.state.requests?.searches / this.state.searchLimit) * 100
              }
            />
          </div>
        </Card>
        <Card noPadding>
          <Typography style={{ padding: 16, paddingBottom: 4 }} variant="h6">
            Productos más buscados
          </Typography>
          <div className="table">
            <div key="title">
              <Typography variant="h6" style={{ marginBottom: 0 }}>
                Producto
              </Typography>
              <Typography variant="h6" style={{ marginBottom: 0 }}>
                Categoría
              </Typography>
              <Typography variant="h6" style={{ marginBottom: 0 }}>
                No. búsquedas
              </Typography>
            </div>
            {this.state.topsearches?.mostSearchedItems?.map((data, index) => (
              <div key={index}>
                <Typography variant="body">{data.id}</Typography>
                <Typography variant="body">{data.cl}</Typography>
                <Typography variant="body">{data.count}</Typography>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }
}

export default Dashboard
