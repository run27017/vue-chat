<template>
  <div class="container">
    <div class="content-container" ref="contentContainer">
      <div ref="content">
        <InfiniteLoading direction="top" @infinite="loadMoreHistory">
          <template #no-more>
            <div class="message-prompt">没有更多消息了</div>
          </template>
          <template #no-results>
            <div class="message-prompt">没有更多消息了</div>
          </template>
        </InfiniteLoading>
        <div v-for="message, index in messages">
          <div class="message-prompt" v-if="isShowTimes[index]">
            {{ message.time | according-to-now }}
          </div>
          <div class="message-cell" 
            :style="{ flexDirection: message.direction === 'received' ? 'row' : 'row-reverse' }" >
            <van-image width="32" height="32" 
              :src="message.direction === 'received' ? targetAvatar : sourceAvatar" />
            <van-button type="default" size="small" round>{{ message.text }}</van-button>
          </div>
        </div>
      </div>
    </div>
    <div class="footer">
      <van-field v-model="typingText" placeholder="输入内容" border>
        <template #button>
          <van-button size="small" type="primary" @click="sendText">发送</van-button>
        </template>
      </van-field>
    </div>
  </div>
</template>

<script>
import zhCode from 'date-fns/locale/zh-CN'
import format from 'date-fns/format'
import formatDistance from 'date-fns/formatDistance'
import differenceInMinutes from 'date-fns/differenceInMinutes'
import differenceInYears from 'date-fns/differenceInYears'
import isSameDay from 'date-fns/isSameDay'

import InfiniteLoading from 'vue-infinite-loading'
import VanButton from 'vant/lib/button'
import 'vant/lib/button/style'
import VanImage from 'vant/lib/image'
import 'vant/lib/image/style'
import VanField from 'vant/lib/field'
import 'vant/lib/field/style'

export default {
  name: 'Chat',
  components: {
    InfiniteLoading,
    'van-button': VanButton,
    'van-image': VanImage,
    'van-field': VanField
  },
  filters: {
    accordingToNow (date) {
      date = date instanceof Date ? date : new Date(date)
      const now = new Date()

      if (differenceInMinutes(now, date) <= 30) {
        return formatDistance(new Date(date), now, { locale: zhCode, addSuffix: true })
      } else if (isSameDay(now, date)) {
        return format(date, 'p', { locale: zhCode })
      } else if (differenceInYears(now, date) < 1) {
        return format(date, 'MMM do p', { locale: zhCode })
      } else {
        return format(date, 'PPP p', { locale: zhCode })
      }
    }
  },
  props: {
    sourceAvatar: String, 
    targetAvatar: String,
    loadHistory: {
      type: Function,
      default () { 
        return { messages: [], hasMore: false } 
      }
    },
    sendMessage: {
      type: Function,
      default ({ text }) {
        return { text, direction: 'sent' }
      }
    }
  },
  data () {
    return {
      messages: [],
      typingText: '',
      scrolledToBottom: false
    }
  },
  computed: {
    isShowTimes () {
      let lastTime = new Date(0)
      return this.messages.map(message => {
        const messageTime = message.time instanceof Date ? message.time : new Date(message.time)

        if (differenceInMinutes(messageTime, lastTime) > 10) {
          lastTime = messageTime
          return true
        } else {
          return false
        }
      })
    }
  },
  methods: {
    sendText () {
      const message = this.sendMessage({ text: this.typingText })
      this.typingText = ''
      if (message instanceof Promise) {
        message.then(
          message => this.appendNew(
            Object.assign({ time: new Date(), direction: 'sent' }, message)
          )
        ).catch(e => console.error('发送消息出错', e))
      } else {
        this.appendNew(Object.assign({ time: new Date(), direction: 'sent' }, message))
      }
    },
    prependHistory (history, $state) {
      const messages = history.messages || []
      // messages 以逆序排列
      this.messages.unshift(...messages.reverse())
      history.hasMore ? $state.loaded() : $state.complete()

      this.$nextTick(() => {
        if (this.scrolledBarVisible) return

        if (this.$refs.content.clientHeight > this.$refs.contentContainer.clientHeight) {
          this.scrollToBottom()
          this.scrolledToBottom = true
        }
      })
    },
    appendNew (...messages) {
      messages = messages.map(message => Object.assign({ direction: 'received' }, message))
      this.messages.push(...messages)
      this.$nextTick(this.scrollToBottom)
    },
    loadMoreHistory ($state) {
      const history = this.loadHistory()
      if (history instanceof Promise) {
        history.then(history => {
          this.prependHistory(history, $state)
        }).catch(e => {
          console.error('加载历史消息出错', e)
        })
      } else {
        this.prependHistory(history, $state)
      }
    },
    scrollToBottom () {
      this.$refs.contentContainer.scrollTop = Number.MAX_SAFE_INTEGER
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .content-container {
    flex-grow: 1;
    overflow-y: auto;
  }

  .footer {
    height: 50px;
  }
}

.message-cell {
  display: flex;
  padding: 2px;
  margin-bottom: 2px;

  > * {
    margin: 2px;
  }
}

.message-prompt {
  text-align: center;
  color: #969799;
  font-size: 14px;
  line-height: 24px;
}
</style>
