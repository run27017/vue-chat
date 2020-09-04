import Vue from 'vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'

Vue.config.productionTip = false

Vue.use(Vant);

new Vue({
  render: h => h(App),
}).$mount('#app')
