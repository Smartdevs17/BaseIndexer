'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transfer_events', 'transactionHash', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null for existing records
    });
    
    // Add index for faster lookups
    await queryInterface.addIndex('transfer_events', ['transactionHash']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('transfer_events', ['transactionHash']);
    await queryInterface.removeColumn('transfer_events', 'transactionHash');
  },
};