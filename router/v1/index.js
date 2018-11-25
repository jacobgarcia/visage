/* eslint-env node */
const path = require('path')
const express = require('express')
const router = new express.Router()

router.use('/engine', require(path.resolve('router/v1/images')))
router.use('/dashboard', require(path.resolve('router/v1/dashboard')))

router.use((req, res) => {
  return res.status(404).json({ message: 'Resource not found' })
})

module.exports = router
