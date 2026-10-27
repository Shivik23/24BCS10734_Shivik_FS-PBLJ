const express = require('express');
const router = express.Router();
const {
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration
} = require('../controllers/registrationController');

router.post('/', createRegistration);
router.get('/', getAllRegistrations);
router.get('/:id', getRegistrationById);
router.put('/:id', updateRegistration);
router.delete('/:id', deleteRegistration);

module.exports = router;
