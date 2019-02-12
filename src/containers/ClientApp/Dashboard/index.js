import React, { Component } from 'react'
import Typography from '@material-ui/core/Typography'
import NetworkOperation from 'utils/NetworkOperation'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = [
  '#98B1CE',
  '#BCD1E0',
  '#C5D4DB',
  '#F4DCDC',
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
    searchChardata: [{ name: 'none', value: 100 }],
    indexChardata: [{ name: 'none', value: 0 }],
  }

  async componentDidMount() {
    try {
      const date = new Date()
      const to = date.getTime()
      date.setMonth(date.getMonth() - 1)
      const from = date.getTime()
      let data = null
      try {
        const {
          data: { user: userData },
        } = await NetworkOperation.getSelf()
        data = userData
      } catch (error) {
        if (error.response?.status === 401) {
          this.props.history.replace('/login')
        } else if (error.response?.status === 400) {
          this.props.history.replace('/login')
        } else {
          // TODO Other error should be displayed
          console.error(error)
        }
      }
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
      const maxRate = billingRes.data.indexRates.map((rate) =>{
        statsRes.data.requests.indexings >= rate.min &&
        statsRes.data.requests.indexings < rate.max ?  rate.max : statsRes.data.requests.indexings
      })

      this.setState({
        billing: billingRes.data.billing,
        requests: statsRes.data.requests,
        topsearches: topsearches.data,
        searchChardata:
          chardata.length > 0 ? chardata : [{ name: 'none', value: 100 }],
        indexChardata: [{name: 'indexed', value: statsRes.data.requests.indexings * 100 / maxRate},
                        {name: 'available', value: (statsRes.data.requests.indexings * 100 / maxRate) - 100}],
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
                    data={this.state.searchChardata}
                    innerRadius="60%"
                    fill="#82ca9d"
                    dataKey="value"
                    label
                  >
                    {this.state.searchChardata.map((data, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} stroke={'#395371'} strokeWidth={2}/>
                    ))}
                  </Pie>
                  <Pie
                    data={this.state.indexChardata}
                    innerRadius="30%"
                    outerRadius="50%"
                    fill="#82ca9d"
                    dataKey="value"
                    label
                  >
                    {this.state.indexChardata.map((data, index) => (
                      <Cell key={index} fill={COLORS[(index % COLORS.length) + 1]} stroke={'#4776AC'} strokeWidth={2}/>
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-chart-info">
                <div className="pie-chart-info-totals">
                  <div className="pie-chart__label">
                    <p style={{color: '#395371', fontSize: '0.9rem', fontWeight: 500}}>Total de búsquedas</p>
                    <Typography variant="h4">
                      {this.state.requests.searches}
                    </Typography>
                  </div>
                  <div className="pie-chart__label">
                    <p style={{color: '#4776AC', fontSize: '0.9rem', fontWeight: 500}}>Total de indexaciones</p>
                    <Typography variant="h4">
                      {this.state.requests.indexings}
                    </Typography>
                  </div>
                </div>
                <div className="pie-chart__legend">
                  <p style={{fontSize: '0.9rem', fontWeight: 500, color: 'gray'}}>Mejores Resultados</p>
                  {this.state.searchChardata.map((data, index) => (
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
