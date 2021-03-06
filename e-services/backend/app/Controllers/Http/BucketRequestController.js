/* eslint-disable camelcase */
'use strict'
const moment = require('moment')

const BucketRequest = use('App/Models/BucketRequest')
const Persona = use('App/Models/Persona')
const Bucket = use('App/Models/Bucket')
const Database = use('Database')
const Address = use('App/Models/Address')

class BucketRequestController {
  async index({ request }) {
    const { page, done_request } = request.get()

    // undefined = 0
    var doneRequest = done => (typeof done === 'undefined' ? 0 : done)

    const bucketRequests = BucketRequest.query()
      .where('done_request', '>=', doneRequest(done_request))
      .with('user')
      .with('persona')
      .with('address')
      .paginate(page)

    return bucketRequests
  }

  async store({ request, auth }) {
    const { id } = auth.user

    const data = request.only([
      'trash_type',
      'number_bucket',
      'due_date',
      'priority',
      'observation'
    ])

    const person = request.input('persona')

    const address = request.input('address')

    const trx = await Database.beginTransaction()

    // CREATE PERSON CASE NOT EXIST
    const persona = await Persona.findOrCreate(
      { document: person.document },
      {
        ...person,
        user_id: id
      },
      trx
    )

    const bucket = await Bucket.findByOrFail(
      'number_bucket',
      data.number_bucket
    )

    // CREATE ADDRESS CASE NOT EXIST
    const addressFindOrCreate = await Address.findOrCreate(
      { ...address },
      { ...address, user_id: id },
      trx
    )

    const bucketRequest = await BucketRequest.create(
      {
        user_id: id,
        persona_id: persona.id,
        address_id: addressFindOrCreate.id,
        bucket_id: bucket.id,
        trash_type: data.trash_type,
        due_date: this.dueData(data.due_date),
        priority: data.priority,
        observation: data.observation,
        protocol: this.protocolGenerate()
      },
      trx
    )

    await trx.commit()

    return bucketRequest
  }

  async show({ params }) {
    const bucketRequest = await BucketRequest.findOrFail(params.id)

    await bucketRequest.load('user')
    await bucketRequest.load('persona')
    await bucketRequest.load('bucket')
    await bucketRequest.load('address')

    return bucketRequest
  }

  async update({ params, request, auth }) {
    const { id } = auth.user
    const bucketRequest = await BucketRequest.findOrFail(params.id)

    const data = request.only([
      'trash_type',
      // 'due_date',
      'priority',
      'observation'
    ])

    const address = request.input('address')

    const trx = await Database.beginTransaction()

    const addressFindOrCreate = await Address.findOrCreate(
      { ...address },
      { ...address, user_id: id },
      trx
    )

    bucketRequest.merge({
      user_id: id,
      address_id: addressFindOrCreate.id,
      trash_type: data.trash_type,
      // due_date: this.dueData(data.due_date),
      priority: data.priority,
      observation: data.observation
    })

    await bucketRequest.save(trx)

    await trx.commit()

    await bucketRequest.load('address')

    return bucketRequest
  }

  async destroy({ params }) {
    const bucketRequest = await BucketRequest.findOrFail(params.id)

    await bucketRequest.delete()
  }

  async doneRequest({ params, request, auth }) {
    const bucketRequest = await BucketRequest.findOrFail(params.id)
    const doneRequest = request.only(['done_request', 'number_bucket'])

    const bucket = await Bucket.findBy(
      'number_bucket',
      doneRequest.number_bucket
    )

    bucketRequest.merge({
      done_request: doneRequest.done_request,
      bucket_id: bucket.id
    })
    await bucketRequest.save()

    return bucketRequest
  }

  protocolGenerate() {
    const dateNow = moment()
      .format('Y-MM-D h:mm:ss')
      .replace(/[\-\:\" "]/g, '')

    return dateNow
  }

  dueData(due) {
    const dueDate = moment()
      .add(due, 'days')
      .format('YYYY-MM-DD HH:mm:ss')

    return dueDate
  }
}

module.exports = BucketRequestController
