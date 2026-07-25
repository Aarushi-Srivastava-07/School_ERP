"use strict";

const ROLES = require('../../auth/constants/roles');

const EXAM_ROLES = Object.freeze({
  ...ROLES,
  PRINCIPAL: 'principal',
});

module.exports = EXAM_ROLES;
