/* eslint-env node */
const express = require('express')
const path = require('path')
const router = new express.Router()

router.use((req, res) => {
  return res.status(400).json({ message: 'No route' })
})

module.exports = router
