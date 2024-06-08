import axios from 'axios'
import env from '../../start/env.js'
import User from '../models/user.js'

export default class Mails {
  static async register(user: User, link: string) {
    await axios.post(`${env.get('SMTP_SERVER')}/send`, {
      to: user.email,
      subject: 'Confirm your account',
      intro: 'Your account has just been created !',
      sender: 'Jest-image-snapshot-manager team',
      action: 'Please click to the button below to confirm your account:',
      link,
    })
  }

  static async invite(user: User, link: string, password: string) {
    await axios.post(`${env.get('SMTP_SERVER')}/send`, {
      to: user.email,
      subject: 'A teamate invite you to join the project',
      intro: 'You have just been invited to join a jest-image-snapshot-manager instance.',
      outro: `A password was generated for you: ${password} (please change it on first connection)`,
      sender: 'Jest-image-snapshot-manager team',
      action: 'Please click to the button below to confirm your account:',
      link,
    })
  }

  static async reset(user: User, newPassword: string) {
    await axios.post(`${env.get('SMTP_SERVER')}/send`, {
      to: user.email,
      subject: 'Reset password',
      intro: 'Your password has just been reseted.',
      outro: `A new one was generated for you: ${newPassword} (please change it on first connection)`,
      sender: 'Jest-image-snapshot-manager team',
    })
  }
}
