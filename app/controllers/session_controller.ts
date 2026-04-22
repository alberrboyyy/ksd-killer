import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ view }: HttpContext) {
    return view.render('pages/login')
  }

  async store({ request, auth, response, session }: HttpContext) {
    const { username, password } = await request.validateUsing(loginValidator)
    const user = await User.verifyCredentials(username, password)

    await auth.use('web').login(user)
    session.flash('success', `Bienvenue ${user.displayName} !`)

    // Redirect based on role
    if (user.role === 'bar') {
      return response.redirect().toRoute('bar.display')
    }
    return response.redirect().toRoute('floor')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    return response.redirect().toRoute('login')
  }
}
