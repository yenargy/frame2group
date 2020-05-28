import './ui.css'
import Vue from "vue";

let app = new Vue({
  el: '#app',
  data: {
  },
  mounted() {
  },
  methods: {
    convertFrames2Groups: function() {
      parent.postMessage({ pluginMessage: { type: 'CONVERT_FRAMES_2_GROUPS', data: null }}, '*')
    }
  },
  watch: {
  },
  computed: {
  }
})

// Function to recieve events from figma
onmessage = e => {
    if (!e.data) return;
  
    const data = e.data.pluginMessage.data;
    const type = e.data.pluginMessage.type;
    console.log(data);
    console.log(type);
};