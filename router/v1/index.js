/* eslint-env node */
const path = require('path')
const express = require('express')
const router = new express.Router()

router.use('/public', require(path.resolve('router/v1/public')))
router.use('/private', require(path.resolve('router/v1/private')))

router.use((req, res) => {
  return res.status(404).json({ message: 'Resource not found' })
})

module.exports = router
