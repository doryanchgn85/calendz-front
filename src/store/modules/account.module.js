import Vue from 'vue'
import router from '../../routes/router'
import UserService from '../../services/user.service'
import ApiService from '../../services/api.service'

const accountModule = {
  namespaced: true,
  // ==================================
  // == State
  // ==================================
  state: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    status: {}
  },

  // ==================================
  // == Mutations
  // ==================================
  mutations: {
    REGISTER_REQUEST: (state) => {
      state.user = null
      state.status = { isRegistering: true }
    },

    REGISTER_SUCCESS: (state) => {
      state.user = null
      state.status = {}
    },

    REGISTER_FAILURE: (state, reason) => {
      state.user = null
      state.status = { reason }
    },

    LOGIN_REQUEST: (state) => {
      state.user = null
      state.status = { isLoggingIn: true }
    },

    LOGIN_SUCCESS: (state, user) => {
      state.user = user
      state.status = {}
    },

    LOGIN_FAILURE: (state, reason) => {
      state.user = null
      state.status = { reason }
    },

    LOGOUT: (state, reason) => {
      state.user = null
      state.status = { reason }
    },

    VERIFY_REQUEST: (state) => {
      state.status = { isVerifying: true }
    },

    VERIFY_SUCCESS: (state, user) => {
      state.status = {}
      state.user = user
    },

    VERIFY_FAILURE: (state, reason) => {
      state.status = { reason }
    },

    REFRESH_REQUEST: (state) => {
      state.status = { isRefreshing: true }
    },

    REFRESH_SUCCESS: (state, user) => {
      state.status = {}
      state.user = user
    },

    REFRESH_FAILURE: (state, reason) => {
      state.user = null
      state.status = { reason }
    }
  },

  // ==================================
  // == Actions
  // ==================================
  actions: {
    register: ({ commit }, { firstname, lastname, grade, email, password, password2, agree }) => {
      commit('REGISTER_REQUEST')
      UserService.register(firstname, lastname, grade, email, password, password2, agree)
        .then(
          res => {
            commit('REGISTER_SUCCESS')
            Vue.prototype.$notify({ type: 'success', timeout: 10000, message: 'Votre compte a bien été créé !' })
            Vue.prototype.$notify({ type: 'info', timeout: 10000, message: 'Veuillez <b>vérifier vos mails</b> afin de confirmer votre adresse avant de vous connecter.' })
            router.push('/login')
          },
          err => {
            let errors = []
            err.data.errors ? errors = err.data.errors : errors.push(err.data.message)
            commit('REGISTER_FAILURE', errors)
          })
    },

    login: ({ commit }, { email, password, rememberMe }) => {
      commit('LOGIN_REQUEST')
      UserService.login(email, password, rememberMe)
        .then(
          res => {
            localStorage.setItem('user', JSON.stringify(res.user))
            commit('LOGIN_SUCCESS', res.user)
            Vue.prototype.$notify({ type: 'success', message: 'Vous êtes désormais connecté.' })
            router.push('/dashboard')
          },
          err => {
            commit('LOGIN_FAILURE', err.data.message)
          })
    },

    // logs the user out
    logout: ({ commit }, { reason }) => {
      if (reason) {
        Vue.prototype.$notify({ type: 'danger', message: `${reason}.` })
      }
      commit('LOGOUT', reason)
      localStorage.removeItem('user')
      ApiService.post('/auth/logout')
      router.push('/login')
    }
  },

  // ==================================
  // == Getters
  // ==================================
  getters: {
    isLoggedIn: state => {
      return !!state.user
    }
  }
}

export default accountModule