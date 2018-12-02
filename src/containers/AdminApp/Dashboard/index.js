import React, { Component } from 'react'
import Card from '@material-ui/core/Card'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Treemap,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Legend,
  Cell
} from 'recharts'
import PropTypes from 'prop-types'

import NetworkOperation from 'utils/NetworkOperation'
import { withSaver } from 'utils/portals'

import './styles.pcss'

const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
]

import { treeMapData, radarData } from './dummy'

class Dashboard extends Component {
  static propTypes = {
    saving: PropTypes.bool,
    toggle: PropTypes.function,
  }

  state = {}

  async componentDidMount() {
    this.props.toggle({ saveButton: false, dateFilter: true })
    try {
      const { data: requestsStats } = await NetworkOperation.getRequestStats()
      const {
        data: billingStats,
      } = await NetworkOperation.getUserBillingStats()

      this.setState({
        requestsStats: requestsStats.requests,
      })
    } catch (error) {
      console.log({ error })
    }
  }

  render() {
    return (
      <div className="dashboard">
        <div className="card-container">
          <div className="card-wrapper">
            <Card className="card">
              <h4>Total de peticiones e imágenes indexadas</h4>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    isAnimationActive={false}
                    data={[
                      {
                        name: 'Búsquedas',
                        value: this.state?.requestsStats?.searches || 0,
                      },
                      {
                        name: 'Indexaciones',
                        value: this.state?.requestsStats?.indexings || 0,
                      },
                    ]}
                    cx="50%"
                    cy={180}
                    innerRadius={90}
                    outerRadius={150}
                    fill="#8884d8"
                    label
                  >
                    <Cell fill={'#A4CFD7'} />

                    <Cell fill={'#98B1CE'} />
                  </Pie>
                  <Legend verticalAlign="bottom" height={36} />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div className="card-wrapper">
            <Card className="card">
              <h4>Consumo de datos por usuario</h4>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart
                  width={600}
                  height={400}
                  data={data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  isAnimationActive={false}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="uv"
                    stroke="#8884d8"
                    fill="#8884d8"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div className="card-wrapper">
            <Card className="card">
              <h4>Clientes con mayor facturación</h4>
              <ResponsiveContainer width="100%" height={400}>
                <Treemap
                  data={treeMapData}
                  dataKey="size"
                  ratio={4 / 3}
                  stroke="#fff"
                  fill="#8783D7"
                  isAnimationActive={false}
                  animationDuration={0}
                />
              </ResponsiveContainer>
            </Card>
          </div>
          <div className="card-wrapper">
            <Card className="card">
              <h4>Resumen de facturación</h4>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData} isAnimationActive={false}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Mike"
                    dataKey="A"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>
      </div>
    )
  }
}

export default withSaver(Dashboard)
