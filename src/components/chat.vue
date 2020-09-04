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
            {{ message.time | beauty-time }}
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
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'Chat',
  components: {
    InfiniteLoading
  },
  filters: {
    beautyTime: function (value) {
      if (moment().diff(value, 'days') < 1) {
        return moment(value).locale('zh-CN').format('hh:mm')
      } else if (moment().diff(value, 'years') < 1) {
        return moment(value).locale('zh-CN').format('MM-DD hh:mm')
      } else {
        return moment(value).locale('zh-CN').format('YYYY-MM-DD hh:mm')
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
      let previousShowTime = new Date(0)
      const showTimes = []
      for (const message of this.messages) {
        if (moment(message.time).diff(previousShowTime, 'minutes') > 10) {
          showTimes.push(true)
          previousShowTime = message.time
        } else {
          showTimes.push(false)
        }
      }
      return showTimes
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
