module.exports = {
  project: {
    name: 'Visual Search ',
    shortName: 'VS',
    themeColor: '#1d2229',
    backgroundColor: '#1d2229',
  },
  secret: 'SvP3-Rs.EcR3T{p455}',
  databaseUri:
    process.env.MONGODB_URL ||
    'mongodb+srv://visual-search-user:pMirQlhcJSPKwxty@cluster0-hu9pf.mongodb.net/visual-search?retryWrites=true',
}
