'use strict'

const User = use('App/Models/User')
// const Database = use('Database')

class UserController {
  async store({ request }) {
    const data = request.only(['username', 'email', 'password', 'profile'])

    // const addresses = request.input('addresses')

    // const trx = await Database.beginTransaction()

    const user = await User.create(data)

    // await user.addresses().createMany(addresses, trx)

    // await trx.commit()

    return user
  }
}

module.exports = UserController
