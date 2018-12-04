import React, { Component } from 'react'
import Card from '@material-ui/core/Card'
import {
  BarChart,
  Bar,
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

import { radarData } from './dummy'

const COLORS = [
  '#BCD1E0',
  '#F4DCDC',
  '#BCD1E0',
  '#98B1CE',
  '#F9CC7A',
  '#E9666E',
]

function CustomizedContent(props) {
  const { root, depth, x, y, width, height, index, colors, name } = props

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill:
            depth < 2
              ? colors[Math.floor((index / (root.children?.length || 1)) * 6)]
              : 'none',
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {depth === 1 ? (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
        >
          {name}
        </text>
      ) : null}
      {depth === 1 ? (
        <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
          {index + 1}
        </text>
      ) : null}
    </g>
  )
}

class Dashboard extends Component {
  static propTypes = {
    barChartData: PropTypes.object,
    from: PropTypes.instanceOf(Date),
    saving: PropTypes.bool,
    to: PropTypes.instanceOf(Date),
    toggle: PropTypes.function,
    treeChartData: PropTypes.object,
  }

  state = {
    from: this.props.from,
    to: this.props.to,
    barChartData: [],
    treeChartData: [],
  }

  componentDidMount() {
    this.props.toggle({ saveButton: false, dateFilter: true })
    this.props.setFilterFunction(this.onFilter)
    this.reloadData()
  }

  onFilter = ({ from, to }) => {
    this.reloadData(from, to)
    this.props.onToggle('showDayPicker')()
  }

  async reloadData(passedFrom = null, passedTo = null) {
    try {
      const barChartData = []
      const treeChartData = []

      const from = passedFrom ? passedFrom.getTime() : this.state.from.getTime()
      const to = passedTo ? passedTo.getTime() : this.state.to.getTime()

      const statsRes = await NetworkOperation.getRequestStats(from, to)
      const billingRes = await NetworkOperation.getUserBillingStats(from, to)

      billingRes.data?.users?.map((user) => {
        barChartData.push({
          name: user?.username,
          index: user?.indexings?.length,
          search: user?.searches?.length,
        })
        treeChartData.push({
          name: user?.username,
          children: [
            { name: 'index', size: user?.indexings?.length },
            { name: 'search', size: user?.searches?.length },
          ],
        })
      })

      this.setState({
        requestsStats: statsRes.data?.requests,
        barChartData: barChartData,
        treeChartData: treeChartData,
      })
    } catch (error) {
      console.log(error)
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
                    isAnimationActive={true}
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
                    cy={170}
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
                <BarChart
                  width={600}
                  height={400}
                  data={this.state.barChartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  isAnimationActive={false}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="index" fill="#A4CFD7" />
                  <Bar dataKey="search" fill="#98B1CE" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
          <div className="card-wrapper">
            <Card className="card">
              <h4>Clientes con mayor facturación</h4>
              <ResponsiveContainer width="100%" height={400}>
                <Treemap
                  width={400}
                  height={200}
                  data={this.state.treeChartData || []}
                  dataKey="size"
                  ratio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                  content={<CustomizedContent colors={COLORS} />}
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
