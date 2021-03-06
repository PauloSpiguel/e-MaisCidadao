'use strict'

const Schema = use('Schema')

class BucketRequestSchema extends Schema {
  up() {
    this.create('bucket_requests', table => {
      table.increments()
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .integer('persona_id')
        .unsigned()
        .references('id')
        .inTable('personas')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .integer('address_id')
        .unsigned()
        .references('id')
        .inTable('addresses')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table.string('trash_type')
      table
        .integer('bucket_id')
        .unsigned()
        .references('id')
        .inTable('buckets')
        .onUpdate('CASCADE')
        .onDelete('SET NULL')
      table
        .integer('priority')
        .notNullable()
        .defaultTo('0')
      table.text('observation')
      table
        .string('protocol')
        .notNullable()
        .unique()
      table.timestamp('due_date')
      table
        .integer('done_request')
        .notNullable()
        .defaultTo('0')
      table.timestamps()
    })
  }

  down() {
    this.drop('bucket_requests')
  }
}

module.exports = BucketRequestSchema
