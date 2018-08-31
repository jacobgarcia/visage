/* eslint-env node */
const express = require('express')
const path = require('path')
const router = new express.Router()

router.use(require(path.resolve('router/v1/images')))

router.use((req, res) => {
  return res.status(400).json({ message: 'No route' })
})

module.exports = router
