'use strict'
const moment = require('moment')

const BucketRequest = use('App/Models/BucketRequest')
const Persona = use('App/Models/Persona')
const Bucket = use('App/Models/Bucket')

class BucketRequestController {
  async index({ request, response }) {
    const bucketRequests = BucketRequest.query()
      .with('user')
      .with('persona')
      .fetch()

    return bucketRequests
  }

  async store({ request, response, auth }) {
    const { id } = auth.user
    const data = request.only([
      'persona',
      'document',
      'cellphone',
      'email',
      'address',
      'trash_type',
      'number_bucket',
      'due_date',
      'priority'
    ])

    let persona = await Persona.findBy('document', data.document)

    if (!persona) {
      persona = await Persona.create({
        user_id: id,
        name: data.persona,
        document: data.document,
        cellphone: data.cellphone,
        email: data.email
      })
    }

    const dueDate = moment()
      .add(data.due_date, 'days')
      .format('YYYY-MM-DD HH:mm:ss')

    const bucket = await Bucket.findByOrFail(
      'number_bucket',
      data.number_bucket
    )

    const bucketRequest = BucketRequest.create({
      user_id: id,
      persona_id: persona.id,
      address: data.address,
      trash_type: data.trash_type,
      bucket_id: bucket.id,
      due_date: dueDate,
      priority: data.priority,
      protocol: this.protocolGenerate()
    })

    return bucketRequest
  }

  async show({ params, request, response, view }) {}

  async update({ params, request, response }) {}

  async destroy({ params, request, response }) {}

  protocolGenerate() {
    const dateNow = moment()
      .format('Y-MM-D h:mm:ss')
      .replace(/[\-\:\" "]/g, '')

    return dateNow
  }
}

module.exports = BucketRequestController