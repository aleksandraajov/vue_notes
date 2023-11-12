const { createApp } = Vue;
createApp({
  data() {
    return {
      notes: [],
      title: "",
      text: "",
      worker: null,
      updateAvailable: false,
      showColors: false,
      colors: [
        { background: "#fff740", shadow: "1px 1px 4px 1px #bfb700" },
        { background: "#feff9c", shadow: "1px 1px 4px 1px #a3a400" },
        { background: "#7afcff", shadow: "1px 1px 4px 1px #009397" },
        { background: "#ff65a3", shadow: "1px 1px 4px 1px #8e0039" },
        { background: "#ff7eb9", shadow: "1px 1px 4px 1px #980046" },
      ],
      color: "#fff740",
      shadow: "1px 1px 4px 1px #bfb700",
    };
  },
  methods: {
    add() {
      if (this.title || this.text) {
        this.notes.push(createNote(this.title, this.text, this.color, this.shadow));
        this.title = "";
        this.text = "";
      }
    },
    del(id) {
      const position = this.notes.findIndex((note) => note.id === id);
      this.notes.splice(position, 1);
    },
    registerServiceWorker() {
      if ("serviceWorker" in navigator) {
        let refreshing;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          window.location.reload();
          regfreshing = true;
        });
        navigator.serviceWorker
          .register("/notes-vue-3/sw.js", { scope: "/notes-vue-3/" })
          .then((registration) => this.handleRegistration(registration))
          .catch((error) => console.log("Service Worker registration failed!", error));
      }
    },
    handleRegistration(registration) {
      const thiz = this;
      registration.addEventListener("updatefound", function () {
        if (registration.installing) {
          thiz.worker = registration.installing;
          thiz.worker.addEventListener("statechange", function () {
            if (thiz.worker.state === "installed") {
              thiz.updateAvailable = true;
            }
          });
        } else if (registration.waiting) {
          thiz.worker = registration.waiting;
          if (thiz.worker.state === "installed") {
            thiz.updateAvailable = true;
          }
        }
      });
    },
    update() {
      this.worker.postMessage({ action: "skipWaiting" });
      this.updateAvailable = false;
    },
    setColor(color) {
      this.color = color.background;
      this.shadow = color.shadow;
      this.showColors = false;
    },
  },
  watch: {
    notes: {
      handler(val) {
        localStorage.setItem("notes", JSON.stringify(val));
      },
      deep: true,
    },
  },
  created() {
    this.notes = JSON.parse(localStorage.getItem("notes")) || [];
    this.registerServiceWorker();
  },
}).mount("#app");


function createNote(title, text, color, shadow) {
    const id = generateId(title, text);
    return { id, title, text, color, shadow };
}

function generateId(title, text, length = 10) {
return CryptoJS.SHA256(title + text + new Date())
    .toString()
    .substring(0, length);
}
