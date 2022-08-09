import { mapMutations } from "vuex"
export default {
  methods: {
    ...mapMutations(["setBusy", "addAlert", "removeAlert"]),
  }
}