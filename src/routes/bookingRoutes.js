const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getTicketByCode,
  cancelBooking,
  updateRefundStatus
} = require('../controllers/bookingController');

router.route('/')
  .get(getBookings)
  .post(createBooking);

router.get('/ticket/:code', getTicketByCode);
router.get('/:code', getTicketByCode);
router.put('/:id/cancelar', cancelBooking);
router.put('/:id/devolucion', updateRefundStatus);
router.put('/:id/refund', updateRefundStatus);

module.exports = router;