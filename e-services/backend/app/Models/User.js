'use strict'

const Model = use('Model')
const Hash = use('Hash')

class User extends Model {
  static boot() {
    super.boot()
    this.addHook('beforeSave', async userInstance => {
      if (userInstance.dirty.password) {
        userInstance.password = await Hash.make(userInstance.password)
      }
    })
  }

  addresses() {
    return this.hasMany('App/Models/UserAddress')
  }
  tokens() {
    return this.hasMany('App/Models/Token')
  }
  services() {
    return this.hasMany('App/Models/Service')
  }
  tasks() {
    return this.hasMany('App/Models/Task')
  }
}

module.exports = User
