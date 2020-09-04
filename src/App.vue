<template>
  <div id="app">
    <ChatBox ref="chat" 
      :sourceAvatar="sourceAvatar" :targetAvatar="targetAvatar" 
      :loadHistory="loadHistory" :sendMessage="sendMessage" />
  </div>
</template>

<script>
import ChatBox from '@/components/chat'

export default {
  name: 'App',
  components: {
    ChatBox
  },
  data () {
    return {
      sourceAvatar: 'https://gitee.com/run27017/assets/raw/master/avatars/girl.jpg',
      targetAvatar: 'https://gitee.com/run27017/assets/raw/master/avatars/bear.jpg'
    }
  },
  methods: {
    loadHistory () {
      return { 
        messages: [
          { text: 'Hello, who are you?', time: new Date(2020, 9, 4), direction: 'sent' },
          { text: "Hey, I'm a bear!", time: new Date(2020, 9, 4), direction: 'received' }
        ], 
        hasMore: false 
      }
    },
    sendMessage ({ text }) {
      return {
        text,
        time: new Date(),
        direction: 'sent'
      }
    }
  }
}
</script>

<style lang="scss">
#app {
  height: 600px;
}
</style>
